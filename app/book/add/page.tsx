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
import { ArrowLeft, ImageIcon, Loader2, Search } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
    const [searchResults, setSearchResults] = useState<SearchBookResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [mode, setMode] = useState<"search" | "manual">("search");
    const [hasSelectedBook, setHasSelectedBook] = useState(false);
    // 마지막으로 자동완성에서 선택한 책 제목 (선택 후에는 같은 제목으로는 다시 검색 안 함)
    const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
    const [popupState, setPopupState] = useState({
        open: false,
        title: "",
        description: "",
        isSuccess: true,
        bookId: null as number | null,
    });

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

    // 책 제목 변경 시 debounce 적용하여 검색
    useEffect(() => {
        if (mode !== "search") {
            return;
        }

        // 자동완성에서 선택한 뒤, 제목을 그대로 두고 있을 때는 다시 검색하지 않음
        if (hasSelectedBook && selectedTitle && title === selectedTitle) {
            setShowSearchResults(false);
            return;
        }
        const timeoutId = setTimeout(() => {
            if (title.trim() && title.length >= 2) {
                searchBooks(title);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300); // 300ms 딜레이

        return () => clearTimeout(timeoutId);
    }, [title, searchBooks, mode, hasSelectedBook, selectedTitle]);

    // 검색 결과에서 책 선택 시 폼 자동 채우기
    const handleSelectBook = (book: SearchBookResponse) => {
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
        setSelectedTitle(book.title || "");
    }

    const handleModeChange = (nextMode: "search" | "manual") => {
        if (nextMode === mode) return;
        setMode(nextMode);
        if (nextMode === "manual") {
            setShowSearchResults(false);
            setSearchResults([]);
            const manualIsbn = buildManualIsbn();
            setIsbn(manualIsbn);
            setHasSelectedBook(false);
            setSelectedTitle(null);
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
          <h1 className="mb-2 text-3xl font-bold">새 책 추가</h1>
          <p className="text-muted-foreground">
            읽고 싶은 책이나 읽고 있는 책을 추가해보세요.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_320px]">
          {/* Right Section - Book Information (모바일에서 상단) */}
          <div className="order-1 space-y-6 rounded-lg border bg-card p-6 lg:order-1">
            <h2 className="text-lg font-semibold">책 정보</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="relative">
                <Label htmlFor="title" className="text-sm font-medium">
                  책 제목
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTitle(next);
                      // 이미 선택된 책이 있는데 제목을 수정하기 시작하면
                      // 다시 검색이 가능하도록 선택 상태를 해제
                      if (hasSelectedBook && selectedTitle && next !== selectedTitle) {
                        setHasSelectedBook(false);
                        setSelectedTitle(null);
                      }
                    }}
                    placeholder={
                      mode === "search"
                        ? "책 제목을 입력하세요 (2글자 이상 자동 검색)"
                        : "책 제목을 직접 입력하세요"
                    }
                    className="pr-10"
                    disabled={mode === "manual" && isSearching}
                  />
                  {mode === "search" && isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {mode === "search" && !isSearching && title.length >= 2 && (
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
                          <img
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
                        책 제목 직접 입력하기
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
                        검색 모드로 돌아가기
                      </button>
                    </div>
                  )}
                </div>
              </div>

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
            </div>

            <div className={`grid gap-6 sm:grid-cols-2 ${hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2" : ""}`}>
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  카테고리
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5">
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

            <div className={hasSelectedBook ? "animate-in fade-in-0 slide-in-from-bottom-2" : ""}>
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
          
          {/* Left Section - Book Cover (모바일에서 제목 아래로 이동) */}
          <div className="order-2 space-y-4 lg:order-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold">책 표지</h2>
              <div
                className={`flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted transition-all duration-500 ease-out ${
                  coverUrl
                    ? "aspect-[3/4] w-40 max-w-[260px] opacity-100 sm:w-48 md:w-56 lg:w-full lg:max-w-none"
                    : "h-32 w-full max-w-[260px] opacity-80"
                }`}
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="책 표지"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-center ${coverUrl ? "hidden" : ""}`}>
                  <ImageIcon className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">검색 후 표지가 자동으로 노출돼요</p>
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