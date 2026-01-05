"use client";

import { Button } from "@/components/ui/button";
import {
    deleteRecentSearch,
    getRecentSearches,
    saveRecentSearch
} from "@/lib/api/search-recent";
import type { RecentSearchListItem } from "@/lib/types/search/recent";
import type { SearchSuggestionsResponse } from "@/lib/types/search/search";
import type { UnifiedSearchResponse } from "@/lib/types/search/unified";
import { transformBooks, transformNotes, transformQuotes } from "@/lib/utils/search-transform";
import { Clock, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookSearchSection } from "./search/BookSearchSection";
import { NoteSearchSection } from "./search/NoteSearchSection";
import { QuoteSearchSection } from "./search/QuoteSearchSection";

const MAX_RECENT_SEARCHES = 6;

type SearchModalProps = {
    onClose: () => void;
};

type SearchableItem = {
    type: "book" | "note" | "quote";
    id: string;
    bookId?: string;
};

export function SearchModal({ onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<UnifiedSearchResponse["data"] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<RecentSearchListItem[]>([]);
    const [isLoadingRecentSearches, setIsLoadingRecentSearches] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 최근 검색어 로드 (서버에서)
    useEffect(() => {
        // 기존 localStorage에 저장된 최근 검색어 데이터 정리 (마이그레이션)
        if (typeof window !== 'undefined') {
            try {
                // 가능한 모든 localStorage 키 패턴 확인 및 삭제
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.toLowerCase().includes('recent') && key.toLowerCase().includes('search') ||
                        key === 'recentSearches' ||
                        key === 'recent_searches' ||
                        key === 'search_history'
                    )) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`[SearchModal] Removed old localStorage key: ${key}`);
                });
            } catch (err) {
                // localStorage 접근 실패 시 무시
                console.warn("Failed to clean up localStorage:", err);
            }
        }

        const loadRecentSearches = async () => {
            setIsLoadingRecentSearches(true);
            try {
                const response = await getRecentSearches(MAX_RECENT_SEARCHES, 'all');
                // 최대 6개로 제한하고 최신순 정렬
                const searches = (response.data.recentSearches || []).slice(0, MAX_RECENT_SEARCHES);
                setRecentSearches(searches);
            } catch (err) {
                console.warn("Failed to load recent searches (backend may not be implemented yet):", err);
                setRecentSearches([]);
            } finally {
                setIsLoadingRecentSearches(false);
            }
        };

        loadRecentSearches();
    }, []);

    // 자동 포커스
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // 최근 검색어는 unified search API에서 결과가 있을 때 서버에서 자동으로 저장됨
    // 프론트엔드에서는 별도로 저장하지 않음

    // 최근 검색어 삭제 (서버에서)
    const removeRecentSearch = useCallback(async (searchId: number) => {
        try {
            await deleteRecentSearch(searchId);
            // 삭제 후 최근 검색어 목록 다시 로드
            const response = await getRecentSearches(MAX_RECENT_SEARCHES, 'all');
            const searches = (response.data.recentSearches || []).slice(0, MAX_RECENT_SEARCHES);
            setRecentSearches(searches);
        } catch (err) {
            // 백엔드가 아직 구현되지 않았거나 에러가 발생해도 조용히 처리
            console.warn("Failed to remove recent search (backend may not be implemented yet):", err);
            // 로컬 상태에서만 제거 (백엔드가 없을 때를 대비)
            setRecentSearches(prev => prev.filter(s => s.id !== searchId));
        }
    }, []);

    // Debounce 검색어 (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // 검색어 추천 (자동완성) - 서버에서 가져오기
    useEffect(() => {
        if (!query.trim() || query.length < 1) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                const params = new URLSearchParams({
                    query: query.trim(),
                    limit: "3",
                });

                const response = await fetch(`/api/v1/search/suggestions?${params}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                });

                const data: SearchSuggestionsResponse = await response.json();

                if (response.ok && data.success) {
                    // 서버에서 받은 추천 검색어를 텍스트 배열로 변환
                    const suggestionTexts = (data.data?.suggestions || []).map(s => s.text);
                    setSuggestions(suggestionTexts);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.warn("Failed to fetch suggestions:", err);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [query]);

    // API 호출
    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setSearchResults(null);
            setError(null);
            return;
        }

        // userId는 서버에서 세션 토큰에서 추출하므로 클라이언트에서는 보내지 않아도 됨
        // 하지만 하위 호환성을 위해 빈 값으로 보냄 (서버에서 세션에서 추출)

        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    query: debouncedQuery,
                    type: "all",
                    page: "1",
                    size: "10",
                });

                const response = await fetch(`/api/v1/search/unified?${params}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                });

                const data: UnifiedSearchResponse = await response.json();

                console.log("[SearchModal] API 응답:", {
                    success: data.success,
                    hasData: !!data.data,
                    booksCount: data.data?.books?.length || 0,
                    notesCount: data.data?.notes?.length || 0,
                    quotesCount: data.data?.quotes?.length || 0,
                    data: data.data
                });

                if (!response.ok) {
                    setError(data.message || "검색 중 오류가 발생했습니다.");
                    setSearchResults(null);
                    return;
                }

                if (data.success) {
                    // data가 없어도 빈 배열로 설정하여 결과가 없다는 것을 표시
                    const results = {
                        books: data.data?.books || [],
                        notes: data.data?.notes || [],
                        quotes: data.data?.quotes || []
                    };
                    setSearchResults(results);
                    
                    // 최근 검색어는 unified search API에서 결과가 있을 때 서버에서 자동으로 저장됨
                    // 검색 결과가 있을 때 최근 검색어 목록 다시 로드
                    const hasResults = (results.books?.length || 0) > 0 || 
                                     (results.notes?.length || 0) > 0 || 
                                     (results.quotes?.length || 0) > 0;
                    if (hasResults) {
                        // 서버에서 자동 저장되었으므로 목록만 다시 로드
                        try {
                            const response = await getRecentSearches(MAX_RECENT_SEARCHES, 'all');
                            const searches = (response.data.recentSearches || []).slice(0, MAX_RECENT_SEARCHES);
                            setRecentSearches(searches);
                        } catch (err) {
                            // 조용히 실패 처리 (백엔드가 아직 구현되지 않았을 수 있음)
                            console.warn("Failed to reload recent searches:", err);
                        }
                    }
                } else {
                    setError(data.message || "검색 중 오류가 발생했습니다.");
                    setSearchResults(null);
                }
            } catch (err) {
                console.error("Search error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "검색 요청에 실패했습니다."
                );
                setSearchResults(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [debouncedQuery]);

    // API 응답을 컴포넌트 타입에 맞게 변환
    const transformedBooks = useMemo(
        () => transformBooks(searchResults?.books),
        [searchResults?.books]
    );

    const transformedNotes = useMemo(
        () => transformNotes(searchResults?.notes),
        [searchResults?.notes]
    );

    const transformedQuotes = useMemo(
        () => transformQuotes(searchResults?.quotes),
        [searchResults?.quotes]
    );

    // 모든 검색 가능한 아이템을 하나의 리스트로 통합
    const allItems = useMemo<SearchableItem[]>(() => {
        const items: SearchableItem[] = [];
        transformedBooks.forEach((book) => {
            items.push({ type: "book", id: book.id });
        });
        transformedNotes.forEach((note) => {
            items.push({ type: "note", id: note.id, bookId: note.bookId });
        });
        transformedQuotes.forEach((quote) => {
            items.push({ type: "quote", id: quote.id, bookId: quote.bookId });
        });
        return items;
    }, [transformedBooks, transformedNotes, transformedQuotes]);

    // 검색 결과가 변경되면 선택 인덱스 초기화
    useEffect(() => {
        setSelectedIndex(-1);
    }, [debouncedQuery, allItems.length]);

    // 아이템 클릭 핸들러
    const handleItemClick = useCallback((item: SearchableItem) => {
        if (item.type === "book") {
            router.push(`/book/${item.id}`);
        } else if (item.type === "note" && item.bookId) {
            router.push(`/book/${item.bookId}/note/${item.id}`);
        } else if (item.type === "quote" && item.bookId) {
            // 인용구는 책 상세 페이지로 이동 (인용구 탭)
            router.push(`/book/${item.bookId}`);
        }
        onClose();
    }, [router, onClose]);

    // 키보드 네비게이션 핸들러
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }

            // 검색 결과가 없으면 방향키 무시
            if (allItems.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            } else if (e.key === "Enter") {
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    const selectedItem = allItems[selectedIndex];
                    handleItemClick(selectedItem);
                } else if (query.trim().length >= 2) {
                    // Enter 키로 검색어 히스토리 추가
                    e.preventDefault();
                    const trimmedQuery = query.trim();
                    // 서버에 저장 시도
                    saveRecentSearch(trimmedQuery, 'all')
                        .then(() => {
                            // 저장 성공 후 최근 검색어 목록 다시 로드
                            return getRecentSearches(MAX_RECENT_SEARCHES, 'all');
                        })
                        .then((response) => {
                            const searches = (response.data.recentSearches || []).slice(0, MAX_RECENT_SEARCHES);
                            setRecentSearches(searches);
                        })
                        .catch(err => {
                            console.warn("Failed to save recent search:", err);
                        });
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [allItems, selectedIndex, onClose, handleItemClick]);

    // 선택된 항목으로 스크롤
    useEffect(() => {
        if (selectedIndex >= 0 && resultsContainerRef.current) {
            const selectedElement = resultsContainerRef.current.querySelector(
                `[data-item-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }
    }, [selectedIndex]);

    // 각 섹션에서 선택된 인덱스 범위 계산
    const getBookIndexRange = () => {
        const start = 0;
        const end = transformedBooks.length;
        return { start, end };
    };

    const getNoteIndexRange = () => {
        const start = transformedBooks.length;
        const end = start + transformedNotes.length;
        return { start, end };
    };

    const getQuoteIndexRange = () => {
        const start = transformedBooks.length + transformedNotes.length;
        const end = start + transformedQuotes.length;
        return { start, end };
    };

    // 검색어 추천은 서버에서 가져오므로 클라이언트에서 처리할 필요 없음

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-8 sm:pt-16 md:pt-24 px-4 sm:px-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl sm:rounded-2xl bg-background/95 border border-border/50 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-12rem)] flex flex-col backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 상단 검색 인풋 영역 */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/50 bg-card/50">
                    <div className="mb-3">
                        <h2 className="font-serif text-lg sm:text-xl font-semibold text-foreground">나의 서재 검색</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            책 제목, 저자, 노트 내용, 인용구를 검색할 수 있어요
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border/50 bg-card/50 px-4 sm:px-5 py-3 sm:py-4 backdrop-blur-sm transition-all">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/60 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="책, 노트, 인용구를 검색하세요..."
                            className="flex-1 bg-transparent outline-none border-none text-sm sm:text-base placeholder:text-muted-foreground/60 pr-2 text-foreground focus:outline-none focus:ring-0"
                        />
                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuery("")}
                                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 rounded-lg hover:bg-muted/50 focus:outline-none focus:ring-0"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">검색어 지우기</span>
                            </Button>
                        )}
                    </div>

                    {/* 자동완성 제안 */}
                    {suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuery(suggestion)}
                                    className="rounded-lg bg-primary/5 px-3 py-1 text-xs text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="hidden sm:inline">⌘K 또는 Ctrl+K로 빠른 검색</span>
                        <span>ESC로 닫기</span>
                    </div>
                </div>

                {/* 본문: 결과 영역 틀 */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0">
                    {!query && (
                        <>
                            <div className="text-center py-8 sm:py-12">
                                <div className="flex justify-center mb-4">
                                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-muted/50">
                                        <Search className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/40" />
                                    </div>
                                </div>
                                <p className="mb-2 font-serif text-base sm:text-lg font-medium text-foreground">
                                    무엇을 찾으시나요?
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    내 서재의 책, 노트, 인용구를 한 번에 검색하세요
                                </p>
                            </div>
                            
                            {/* 최근 검색어 섹션 */}
                            {!isLoadingRecentSearches && recentSearches.length > 0 && (
                                <div className="mt-auto pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-medium text-muted-foreground">최근 검색</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((search) => (
                                            <div
                                                key={search.id}
                                                onClick={() => setQuery(search.query)}
                                                className="group inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm bg-[#8B7355]/5 border border-border/50 hover:bg-[#8B7355]/10 hover:border-[#8B7355]/30 hover:shadow-sm text-foreground transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <span>{search.query}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeRecentSearch(search.id);
                                                    }}
                                                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all focus:outline-none"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {query && query.length < 2 && (
                        <div className="text-center py-8 sm:py-12">
                            <p className="text-sm sm:text-base text-muted-foreground">
                                검색어는 최소 2자 이상 입력해주세요.
                            </p>
                        </div>
                    )}

                    {query && query.length >= 2 && isLoading && (
                        <div className="flex items-center justify-center py-12 sm:py-16">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                            <span className="ml-3 text-sm sm:text-base text-muted-foreground">검색 중...</span>
                        </div>
                    )}

                    {query && query.length >= 2 && error && (
                        <div className="text-center py-8 sm:py-12">
                            <p className="text-sm sm:text-base text-destructive">{error}</p>
                        </div>
                    )}

                    {query && query.length >= 2 && !isLoading && !error && searchResults && (
                        <>
                            {/* 결과가 있는 경우 */}
                            {(transformedBooks.length > 0 || transformedNotes.length > 0 || transformedQuotes.length > 0) && (
                                <div ref={resultsContainerRef} className="space-y-4 sm:space-y-6">
                                    <BookSearchSection
                                        items={transformedBooks}
                                        query={debouncedQuery}
                                        selectedIndex={selectedIndex}
                                        indexRange={getBookIndexRange()}
                                        onItemClick={handleItemClick}
                                    />
                                    <NoteSearchSection
                                        items={transformedNotes}
                                        query={debouncedQuery}
                                        selectedIndex={selectedIndex}
                                        indexRange={getNoteIndexRange()}
                                        onItemClick={handleItemClick}
                                    />
                                    <QuoteSearchSection
                                        items={transformedQuotes}
                                        query={debouncedQuery}
                                        selectedIndex={selectedIndex}
                                        indexRange={getQuoteIndexRange()}
                                        onItemClick={handleItemClick}
                                    />
                                </div>
                            )}
                            
                            {/* 결과가 없는 경우 */}
                            {transformedBooks.length === 0 && 
                             transformedNotes.length === 0 && 
                             transformedQuotes.length === 0 && (
                                <div className="text-center py-12 sm:py-16 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                                    <div className="flex justify-center mb-3">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted/50">
                                            <Search className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/40" />
                                        </div>
                                    </div>
                                    <p className="mb-1 text-sm sm:text-base font-medium text-foreground">
                                        &apos;<span className="font-semibold">{query}</span>&apos;에 대한 결과가 없습니다
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        다른 키워드로 검색해보세요
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 푸터 안내 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2.5 sm:py-2 border-t border-border/50 bg-muted/40">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                        ↑↓ 로 이동 · Enter로 열기 · Esc 로 닫기
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground sm:hidden">
                        Enter로 열기 · Esc 로 닫기
                    </p>
                    {query && query.length >= 2 && (transformedBooks.length > 0 || transformedNotes.length > 0 || transformedQuotes.length > 0) && (
                        <button
                            type="button"
                            className="text-[10px] sm:text-[11px] text-primary hover:underline font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                            onClick={() => {
                                // TODO: 전체 결과 보기 페이지로 이동
                                console.log("전체 결과 보기:", query);
                            }}
                        >
                            &apos;{query}&apos; 전체 결과 보기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}