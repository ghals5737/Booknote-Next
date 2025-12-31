'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AddUserBookRequest, BOOK_CATEGORY_IDS, BOOK_CATEGORY_LABELS, SearchBookResponse } from "@/lib/types/book/book";
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Image from "next/image";
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
    
    const isFormValid = title.trim().length > 0 && author.trim().length > 0;
    
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
              body: JSON.stringify(requestData),
            });
            const data = await response.json();
            console.log(data);
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
              setPopupState({
                open: true,
                title: '책 추가 실패',
                description: data.message || '책 추가 중 문제가 발생했습니다.',
                isSuccess: false,
                bookId: null,
              });
            }
            return data;        
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
        <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          내 서재로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">내 서재에 담기</h1>
          <p className="text-muted-foreground">
            읽고 싶은 책이나 읽고 있는 책을 추가해보세요.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Main Section - Book Information & Cover */}
          <div className="order-1 space-y-6 rounded-lg border bg-card p-6 lg:order-1">

            {/* 통합 검색 인풋 */}
            <div className="relative">
             
              <div className="relative mt-1.5">
                <Input
                  id="book-search"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    // 이미 선택된 책이 있는데 검색어를 수정하기 시작하면
                    // 다시 검색이 가능하도록 선택 상태를 해제
                    if (hasSelectedBook && selectedSearchQuery && value !== selectedSearchQuery) {
                      setHasSelectedBook(false);
                      setSelectedSearchQuery(null);
                    }
                  }}
                  placeholder={
                    mode === "search"
                      ? "책 제목, 저자, 출판사 등으로 검색하세요 (2글자 이상 자동 검색)"
                      : "검색은 비활성화되어 있어요. 아래에서 직접 입력해주세요."
                  }
                  className="pr-10"
                  disabled={mode === "manual"}
                />
                {mode === "search" && isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {mode === "search" && !isSearching && searchQuery.length >= 2 && (
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>

              {/* 검색 결과 플로팅 드롭다운 */}
              {mode === "search" && showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-card/95 shadow-xl backdrop-blur">
                  {searchResults.map((book, index) => (
                    <button
                      type="button"
                      key={book.isbn || `book-${index}`}
                      className="flex w-full items-center gap-3 border-b p-3 text-left hover:bg-muted last:border-b-0 focus:bg-muted focus:outline-none"
                      onClick={() => handleSelectBook(book)}
                    >
                      {book.image && (
                        <Image
                          src={book.image}
                          alt={book.title}
                          className="h-14 w-10 flex-shrink-0 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {book.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {book.author}
                        </div>
                        {book.publisher && (
                          <div className="truncate text-[11px] text-muted-foreground/70">
                            {book.publisher}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {mode === "search" ? (
                  <>
                    원하는 책이 보이지 않나요?{" "}
                    <button
                      type="button"
                      className="text-primary font-medium underline-offset-2 hover:underline"
                      onClick={() => handleModeChange("manual")}
                    >
                      책 정보를 직접 입력할게요
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span>직접 입력 모드입니다. ISBN은 자동으로 생성됩니다.</span>
                    <button
                      type="button"
                      className="self-start text-primary font-medium underline-offset-2 hover:underline"
                      onClick={() => handleModeChange("search")}
                    >
                      다시 검색해서 찾을래요
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 표지 + 책 정보 영역: 모바일에서는 세로, PC에서는 좌우 배치 */}
            <div className="mt-6 space-y-6 lg:mt-8 lg:flex lg:items-stretch lg:gap-8 lg:space-y-0">
              {/* 모바일: 검색 아래, PC: 왼쪽 세로 표지 카드 */}
              {coverUrl && (
                <div
                  ref={coverSectionRef}
                  className="flex justify-center lg:w-[260px] lg:flex-shrink-0 lg:justify-start"
                >
                  <div
                    className={`flex items-center justify-center overflow-hidden rounded-lg bg-muted transition-all duration-500 ease-out ${
                      coverUrl
                        ? "aspect-[3/4] w-[90%] max-w-[320px] opacity-100 lg:h-full lg:aspect-auto lg:w-full lg:max-w-none"
                        : "h-32 w-[90%] max-w-[320px] opacity-80 lg:h-full lg:w-full lg:max-w-none"
                    }`}
                  >
                    <Image
                      src={coverUrl}
                      alt="책 표지"
                      className="h-full w-full object-cover"
                      style={{ transform: "rotate(-1deg)" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 책 정보 폼 (PC에서는 오른쪽 컬럼) */}
              <div className="flex-1">
                {/* 선택/입력된 책 정보 필드 */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* 1순위: 책 제목 - 길이가 길 수 있어서 전체 너비 사용 */}
                  <div className={hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2 sm:col-span-2" : "sm:col-span-2"}>
                    <Label htmlFor="title" className="text-sm font-medium">
                      책 제목
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="책 제목을 입력하세요"
                      className="mt-1.5"
                    />
                  </div>

                  {/* 2순위: 저자 / 3순위: 출판사 - 나란히 배치해도 충분한 길이 */}
                  <div className={hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2" : ""}>
                    <Label htmlFor="author" className="text-sm font-medium">
                      저자
                    </Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="저자명을 입력하세요"
                      className="mt-1.5"
                    />
                  </div>

                  <div className={hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2" : ""}>
                    <Label htmlFor="publisher" className="text-sm font-medium">
                      출판사
                    </Label>
                    <Input
                      id="publisher"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="출판사를 입력하세요"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className={`mt-6 grid gap-6 sm:grid-cols-2 ${hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2" : ""}`}>
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      카테고리
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5 w-full">
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
                    <Label htmlFor="pages" className="text-sm font-medium">
                      총 페이지
                    </Label>
                    <Input
                      id="pages"
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="총 페이지 수"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className={hasSelectedBook ? "mt-6 animate-in fade-in-0 slide-in-from-bottom-2" : "mt-6"}>
                  <Label htmlFor="description" className="text-sm font-medium">
                    책 설명
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="책에 대한 간단한 설명을 입력하세요"
                    className="mt-1.5 min-h-[120px] resize-none"
                    maxLength={500}
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">{description.length}/500자</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/">취소</Link>
          </Button>
          <Button onClick={handleAddBook} disabled={!isFormValid}>
            <span className="mr-1" aria-hidden="true">+</span>
            <span>책 추가하기</span>
          </Button>
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