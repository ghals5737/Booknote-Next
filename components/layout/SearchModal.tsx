"use client";

import { Button } from "@/components/ui/button";
import type { UnifiedSearchResponse } from "@/lib/types/search/unified";
import { transformBooks, transformNotes, transformQuotes } from "@/lib/utils/search-transform";
import { Clock, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookSearchSection } from "./search/BookSearchSection";
import { NoteSearchSection } from "./search/NoteSearchSection";
import { QuoteSearchSection } from "./search/QuoteSearchSection";

type SearchModalProps = {
    onClose: () => void;
};

type SearchableItem = {
    type: "book" | "note" | "quote";
    id: string;
    bookId?: string;
};

const RECENT_SEARCHES_KEY = "booknote_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export function SearchModal({ onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<UnifiedSearchResponse["data"] | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const resultsContainerRef = useRef<HTMLDivElement>(null);

    // 최근 검색어 로드
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setRecentSearches(Array.isArray(parsed) ? parsed : []);
                }
            } catch (err) {
                console.error("Failed to load recent searches:", err);
            }
        }
    }, []);

    // 최근 검색어 저장 (ref를 사용하여 최신 상태 참조)
    const recentSearchesRef = useRef<string[]>(recentSearches);
    
    useEffect(() => {
        recentSearchesRef.current = recentSearches;
    }, [recentSearches]);

    const saveRecentSearch = useCallback((searchTerm: string) => {
        if (!searchTerm.trim() || searchTerm.length < 2) return;

        if (typeof window === "undefined") return;

        try {
            const trimmed = searchTerm.trim();
            const current = recentSearchesRef.current.filter((s) => s !== trimmed);
            const updated = [trimmed, ...current].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            setRecentSearches(updated);
        } catch (err) {
            console.error("Failed to save recent search:", err);
        }
    }, []);

    // 최근 검색어 삭제
    const removeRecentSearch = useCallback((searchTerm: string) => {
        if (typeof window === "undefined") return;

        try {
            const updated = recentSearches.filter((s) => s !== searchTerm);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            setRecentSearches(updated);
        } catch (err) {
            console.error("Failed to remove recent search:", err);
        }
    }, [recentSearches]);

    // Debounce 검색어 (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
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
                    setSearchResults({
                        books: data.data?.books || [],
                        notes: data.data?.notes || [],
                        quotes: data.data?.quotes || []
                    });
                    // 검색 성공 시 최근 검색어에 추가
                    saveRecentSearch(debouncedQuery);
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
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                const selectedItem = allItems[selectedIndex];
                handleItemClick(selectedItem);
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-8 sm:pt-16 md:pt-24 px-4 sm:px-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-12rem)] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 상단 검색 인풋 영역 */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 border-b border-border bg-muted/60 relative">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="책 / 노트 / 인용구를 한 번에 검색해보세요"
                        className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground pr-2"
                    />
                    <span className="hidden md:inline-flex items-center rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        ⌘K
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 md:hidden"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">닫기</span>
                    </Button>
                </div>

                {/* 본문: 결과 영역 틀 */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0">
                    {!query && (
                        <>
                            <div className="text-center py-8 sm:py-12">
                                <div className="flex justify-center mb-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <Search className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    검색어를 입력하면 내 책, 노트, 인용구를 한 번에 보여드려요.
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground hidden sm:block">
                                    ⌘K 또는 Ctrl+K로 빠르게 검색할 수 있어요
                                </p>
                            </div>
                            
                            {/* 최근 검색어 섹션 */}
                            {recentSearches.length > 0 && (
                                <div className="mt-auto pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-sm font-medium text-foreground">최근 검색</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((searchTerm, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setQuery(searchTerm)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                            >
                                                <span>{searchTerm}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeRecentSearch(searchTerm);
                                                    }}
                                                    className="ml-1 hover:text-destructive transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </button>
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
                                <div ref={resultsContainerRef} className="space-y-4">
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
                                <div className="text-center py-12 sm:py-16">
                                    <div className="flex justify-center mb-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <Search className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        &apos;<span className="font-medium text-foreground">{query}</span>&apos;에 대한 검색 결과가 없습니다.
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        다른 검색어를 시도해보세요
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 푸터 안내 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2.5 sm:py-2 border-t border-border bg-muted/40">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:block">
                        ↑↓ 로 이동 · Enter로 열기 · Esc 로 닫기
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground sm:hidden">
                        Enter로 열기 · Esc 로 닫기
                    </p>
                    {query && query.length >= 2 && (
                        <button
                            type="button"
                            className="text-[10px] sm:text-[11px] text-primary hover:underline font-medium transition-colors"
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