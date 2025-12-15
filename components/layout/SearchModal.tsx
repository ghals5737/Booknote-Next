"use client";

import type { UnifiedSearchResponse } from "@/lib/types/search/unified";
import { transformBooks, transformNotes, transformQuotes } from "@/lib/utils/search-transform";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookSearchSection } from "./search/BookSearchSection";
import { NoteSearchSection } from "./search/NoteSearchSection";
import { QuoteSearchSection } from "./search/QuoteSearchSection";

type SearchModalProps = {
    onClose: () => void;
};

export function SearchModal({ onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<UnifiedSearchResponse["data"] | null>(null);

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

                if (!response.ok) {
                    setError(data.message || "검색 중 오류가 발생했습니다.");
                    setSearchResults(null);
                    return;
                }

                if (data.success && data.data) {
                    setSearchResults(data.data);
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-24"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 상단 검색 인풋 영역 */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/60">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="책 / 노트 / 인용구를 한 번에 검색해보세요"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                    <span className="hidden sm:inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        ⌘K
                    </span>
                </div>

                {/* 본문: 결과 영역 틀 */}
                <div className="max-h-[24rem] overflow-y-auto px-4 py-3 space-y-4">
                    {!query && (
                        <div className="text-xs text-muted-foreground">
                            검색어를 입력하면 내 책, 노트, 인용구를 한 번에 보여줄게요.
                        </div>
                    )}

                    {query && query.length < 2 && (
                        <div className="text-xs text-muted-foreground">
                            검색어는 최소 2자 이상 입력해주세요.
                        </div>
                    )}

                    {query && query.length >= 2 && isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-xs text-muted-foreground">검색 중...</span>
                        </div>
                    )}

                    {query && query.length >= 2 && error && (
                        <div className="text-xs text-destructive py-4">{error}</div>
                    )}

                    {query && query.length >= 2 && !isLoading && !error && searchResults && (
                        <div className="space-y-4">
                            <BookSearchSection items={transformedBooks} query={debouncedQuery} />
                            <NoteSearchSection items={transformedNotes} query={debouncedQuery} />
                            <QuoteSearchSection items={transformedQuotes} query={debouncedQuery} />
                        </div>
                    )}

                    {query && query.length >= 2 && !isLoading && !error && searchResults && 
                     !searchResults.books?.length && 
                     !searchResults.notes?.length && 
                     !searchResults.quotes?.length && (
                        <div className="text-xs text-muted-foreground py-4">
                            '{query}'에 대한 검색 결과가 없습니다.
                        </div>
                    )}
                </div>

                {/* 푸터 안내 */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/40">
                    <p className="text-[11px] text-muted-foreground">
                        ↑↓ 로 이동 · Enter로 열기 · Esc 로 닫기
                    </p>
                    {query && (
                        <button
                            type="button"
                            className="text-[11px] text-primary hover:underline"
                        >
                            ‘{query}’ 전체 결과 보기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}