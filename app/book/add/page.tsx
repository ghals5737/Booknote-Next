'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserBookRequest, BOOK_CATEGORY_IDS, BOOK_CATEGORY_LABELS, SearchBookResponse } from "@/lib/types/book/book";
import { ArrowLeft, BookOpen, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const MANUAL_ISBN_PREFIX = "직접입력용 prefix";

const buildManualIsbn = () => {
    const now = new Date();
    const dateSegment = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
    ].join("");
    const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${MANUAL_ISBN_PREFIX}${dateSegment}-${randomSegment}`;
};

export default function AddBookPage() {
    const router = useRouter();
    // 폼 상태
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState("");
    const [pages, setPages] = useState("");
    const [description, setDescription] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [isbn, setIsbn] = useState("");
    const [publisher, setPublisher] = useState("");
    const [pubdate, setPubdate] = useState("");
    // 검색 상태
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchBookResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [mode, setMode] = useState<"search" | "manual">("search");
    const [hasSelectedBook, setHasSelectedBook] = useState(false);
    // 마지막으로 검색 결과에서 선택한 검색어 (동일 검색어로는 다시 자동 검색 안 함)
    const [selectedSearchQuery, setSelectedSearchQuery] = useState<string | null>(null);
    const [popupState, setPopupState] = useState({
        open: false,
        title: "",
        description: "",
        isSuccess: true,
        bookId: null as number | null,
    });

    // 책 표지 섹션으로 스크롤하기 위한 ref
    const coverSectionRef = useRef<HTMLDivElement | null>(null);

    // 부드러운 스크롤 유틸 (duration ms 동안 스크롤)
    const smoothScrollTo = (targetY: number, duration: number) => {
        if (typeof window === "undefined") return;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            window.scrollTo(0, startY + distance * eased);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const searchBooks = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/v1/search/books?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            console.log(data);
            
            if (data.success && data.data) {
                setSearchResults(Array.isArray(data.data) ? data.data : []);
                setShowSearchResults(true);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        } catch (error) {
            console.error('책 검색 실패:', error);
            setSearchResults([]);
            setShowSearchResults(false);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 검색어 변경 시 debounce 적용하여 검색
    useEffect(() => {
        if (mode !== "search") {
            return;
        }

        // 자동완성에서 선택한 뒤, 검색어를 그대로 두고 있을 때는 다시 검색하지 않음
        if (hasSelectedBook && selectedSearchQuery && searchQuery === selectedSearchQuery) {
            setShowSearchResults(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            if (searchQuery.trim() && searchQuery.length >= 2) {
                searchBooks(searchQuery);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300); // 300ms 딜레이

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchBooks, mode, hasSelectedBook, selectedSearchQuery]);

    // 검색 결과에서 책 선택 시 폼 자동 채우기
    const handleSelectBook = (book: SearchBookResponse) => {
        setSearchQuery(book.title || "");
        setSelectedSearchQuery(book.title || "");
        setTitle(book.title || "");
        setAuthor(book.author || "");
        setDescription(book.description || "");
        setCoverUrl(book.image || "");
        setShowSearchResults(false);
        setIsbn(book.isbn || "");
        setPublisher(book.publisher || "");
        setPubdate(book.pubdate || "");
        setMode("search");
        // 가상의 페이지 수 자동 입력 (실제 API에 맞게 조정 가능)
        setPages((prev) => prev || "300");
        setHasSelectedBook(true);

        // 책 표지 섹션으로 부드럽게 스크롤 (렌더가 끝난 뒤에 실행되도록 지연)
        setTimeout(() => {
            if (!coverSectionRef.current) return;
            const rect = coverSectionRef.current.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - 16; // 상단에 살짝 여백
            smoothScrollTo(targetY, 800); // 800ms 동안 천천히 스크롤
        }, 0);
    }

    const handleModeChange = (nextMode: "search" | "manual") => {
        if (nextMode === mode) return;
        setMode(nextMode);
        if (nextMode === "manual") {
            setShowSearchResults(false);
            setSearchResults([]);
            setSearchQuery("");
            setSelectedSearchQuery(null);
            const manualIsbn = buildManualIsbn();
            setIsbn(manualIsbn);
            setHasSelectedBook(false);
        } else {
            setIsbn("");
        }
    };

    const ensureIsbnForMode = () => {
        if (mode === "manual") {
            if (!isbn) {
                const value = buildManualIsbn();
                setIsbn(value);
                return value;
            }
            return isbn;
        }
        return isbn;
    };
    
    const isFormValid = title.trim().length > 0 && author.trim().length > 0 && category.trim().length > 0;
    
    // 책 설명 최대 글자 수 (안전하게 1500자로 제한)
    const MAX_DESCRIPTION_LENGTH = 1500;
    
    const handleAddBook = async () => {
        console.log('handleAddBook');
        if (!title.trim() || !author.trim() || !category.trim()) {
            setPopupState({
                open: true,
                title: "필수 입력 누락",
                description: "책 제목, 저자, 카테고리는 반드시 입력해야 합니다.",
                isSuccess: false,
                bookId: null,
            });
            return;
        }
        
        // 책 설명 글자 수 체크
        if (description.length > MAX_DESCRIPTION_LENGTH) {
            setPopupState({
                open: true,
                title: "입력 오류",
                description: `책 설명은 최대 ${MAX_DESCRIPTION_LENGTH}자까지 입력할 수 있습니다. (현재: ${description.length}자)`,
                isSuccess: false,
                bookId: null,
            });
            return;
        }
        const isbnValue = ensureIsbnForMode();
        const requestData: AddUserBookRequest = {
            title: title,
            author: author,
            description: description,
            category: category,
            progress: 0,
            totalPages: Number.parseInt(pages || "0", 10) || 0,
            imgUrl: coverUrl,
            isbn: isbnValue,
            publisher: publisher,
            pubdate: pubdate,
        }
        try {
            const response = await fetch('/api/v1/user-books', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
            });
            const data = await response.json();
            
            if (data.success) {
              const bookId = data.data?.id || data.data?.bookId || null;
              setPopupState({
                open: true,
                title: '책 추가 완료',
                description: '책이 내 서재에 추가되었습니다.',
                isSuccess: true,
                bookId: bookId,
              });
            } else {
              // 에러 상세 정보 파싱
              let errorMessage = data.message || '책 추가 중 문제가 발생했습니다.';
              let errorTitle = '책 추가 실패';
              
              // details가 있으면 파싱 시도
              if (data.details) {
                try {
                  const errorDetails = typeof data.details === 'string' 
                    ? JSON.parse(data.details) 
                    : data.details;
                  
                  if (errorDetails.code === 'BOOK_ALREADY_EXISTS') {
                    errorTitle = '이미 등록된 책입니다';
                    errorMessage = '이 책은 이미 내 서재에 등록되어 있습니다.';
                  } else if (errorDetails.message) {
                    errorMessage = errorDetails.message;
                  }
                } catch (parseError) {
                  // JSON 파싱 실패 시 원본 메시지 사용
                  console.error('에러 상세 정보 파싱 실패:', parseError);
                }
              }
              
              setPopupState({
                open: true,
                title: errorTitle,
                description: errorMessage,
                isSuccess: false,
                bookId: null,
              });
            }
        } catch (error) {
            console.error('책 추가 실패:', error);
            setPopupState({
                open: true,
                title: '책 추가 실패',
                description: '책 추가 중 오류가 발생했습니다.',
                isSuccess: false,
                bookId: null,
            });
        }
    }
    
    const handlePopupConfirm = () => {
        const wasSuccess = popupState.isSuccess;
        const bookId = popupState.bookId;
        setPopupState((prev) => ({ ...prev, open: false }));
        if (wasSuccess && bookId) {
            router.push(`/book/${bookId}`);
        } else if (wasSuccess) {
            // bookId가 없는 경우 대시보드로
            router.push('/dashboard');
        }
    };


    return (
        <div className="min-h-screen bg-[#F5F1EB]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/library"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>내 서재로 돌아가기</span>
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold text-foreground">
            내 서재에 책 등록
          </h1>
        </div>

        {/* 메인 카드 */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          {/* 검색 영역 */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-foreground">
              책 제목, 저자, 출판사로 검색 {mode === "search" && "(2글자 이상 자동 검색)"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (hasSelectedBook && selectedSearchQuery && value !== selectedSearchQuery) {
                    setHasSelectedBook(false);
                    setSelectedSearchQuery(null);
                  }
                }}
                placeholder={
                  mode === "search"
                    ? "책 제목, 저자, 출판사 등으로 검색하세요"
                    : "검색은 비활성화되어 있어요. 아래에서 직접 입력해주세요."
                }
                disabled={mode === "manual"}
                className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-3 pr-10 transition-all focus:border-primary focus:bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              {mode === "search" && isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {mode === "search" && !isSearching && searchQuery.length >= 2 && (
                <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>

            {/* 검색 결과 드롭다운 */}
            {mode === "search" && showSearchResults && searchResults.length > 0 && (
              <div className="relative z-50 mt-2">
                <div className="max-h-80 overflow-y-auto rounded-xl border border-border/50 bg-card shadow-lg">
                  {searchResults.map((book, index) => (
                    <button
                      key={book.isbn || `book-${index}`}
                      type="button"
                      onClick={() => handleSelectBook(book)}
                      className="flex w-full items-center gap-4 border-b border-border/30 p-4 text-left transition-colors last:border-b-0 hover:bg-secondary/30"
                    >
                      {book.image && (
                        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted shadow-sm">
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 truncate font-medium text-foreground">
                          {book.title}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {book.author}
                        </div>
                        {book.publisher && (
                          <div className="mt-0.5 truncate text-xs text-muted-foreground/70">
                            {book.publisher}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 모드 전환 안내 */}
            <div className="mt-3 text-sm text-muted-foreground">
              {mode === "search" ? (
                <>
                  원하는 책이 보이지 않나요?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("manual")}
                    className="font-medium text-primary underline-offset-2 transition-colors hover:underline"
                  >
                    책 정보를 직접 입력할게요
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span>직접 입력 모드입니다. ISBN은 자동으로 생성됩니다.</span>
                  <button
                    type="button"
                    onClick={() => handleModeChange("search")}
                    className="self-start font-medium text-primary underline-offset-2 transition-colors hover:underline"
                  >
                    다시 검색해서 찾을래요
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 책 표지 + 정보 영역 */}
          <div className="space-y-8 lg:flex lg:gap-8 lg:space-y-0">
            {/* 책 표지 */}
            {coverUrl && (
              <div
                ref={coverSectionRef}
                className="flex justify-center lg:w-64 lg:flex-shrink-0"
              >
                <div className="relative aspect-[3/4] w-48 overflow-hidden rounded-xl shadow-lg lg:w-full">
                  <Image
                    src={coverUrl}
                    alt="책 표지"
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-border/20" />
                </div>
              </div>
            )}

            {/* 책 정보 폼 */}
            <div className="flex-1 space-y-6">
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  책 제목 <span className="text-primary">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="책 제목을 입력하세요"
                  className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none"
                />
              </div>

              {/* 저자 & 출판사 */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="author" className="mb-2 block text-sm font-medium">
                    저자 <span className="text-primary">*</span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="저자명을 입력하세요"
                    className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="publisher" className="mb-2 block text-sm font-medium">
                    출판사
                  </label>
                  <input
                    id="publisher"
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="출판사를 입력하세요"
                    className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              {/* 카테고리 & 총 페이지 */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    카테고리 <span className="text-primary">*</span>
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none">
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOK_CATEGORY_IDS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {BOOK_CATEGORY_LABELS[id]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="pages" className="mb-2 block text-sm font-medium">
                    총 페이지
                  </label>
                  <input
                    id="pages"
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="총 페이지 수"
                    className="w-full rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              {/* 책 설명 */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  책 설명
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_DESCRIPTION_LENGTH) {
                      setDescription(value);
                    }
                  }}
                  placeholder="책에 대한 간단한 설명을 입력하세요"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                  className="w-full resize-none rounded-xl border-2 border-border/50 bg-background/80 px-4 py-2.5 transition-all focus:border-primary focus:bg-background focus:outline-none"
                />
                <p className={`mt-1.5 text-right text-xs ${
                  description.length > MAX_DESCRIPTION_LENGTH
                    ? "text-destructive font-semibold" 
                    : description.length > MAX_DESCRIPTION_LENGTH * 0.9
                    ? "text-amber-600" 
                    : "text-muted-foreground"
                }`}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}자
                  {description.length > MAX_DESCRIPTION_LENGTH && " (초과되었습니다)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border-2 border-border/50 bg-card/50 px-6 py-3 font-medium transition-all hover:bg-card hover:shadow-sm"
          >
            취소
          </button>
          <button
            onClick={handleAddBook}
            disabled={!isFormValid || !category.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary disabled:hover:shadow-md"
          >
            <BookOpen className="h-4 w-4" />
            <span>책 추가하기</span>
          </button>
        </div>
      </div>
      <Dialog open={popupState.open} onOpenChange={(open) => setPopupState((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className={popupState.isSuccess ? "text-green-600" : "text-red-500"}>
              {popupState.title}
            </DialogTitle>
            <DialogDescription>
              {popupState.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handlePopupConfirm}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    )
}