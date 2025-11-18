'use client';

import { Button } from "@/components/ui/button";
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
import { SearchBookResponse } from "@/lib/types/book/book";
import { ArrowLeft, ImageIcon, Loader2, Search } from 'lucide-react';
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AddBookPage() {
    // 폼 상태
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState("");
    const [pages, setPages] = useState("");
    const [description, setDescription] = useState("");
    const [coverUrl, setCoverUrl] = useState("");

    // 검색 상태
    const [searchResults, setSearchResults] = useState<SearchBookResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

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
        const timeoutId = setTimeout(() => {
            if (title.trim() && title.length >= 2) {
                searchBooks(title);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300); // 300ms 딜레이

        return () => clearTimeout(timeoutId);
    }, [title, searchBooks]);

    // 검색 결과에서 책 선택 시 폼 자동 채우기
    const handleSelectBook = (book: SearchBookResponse) => {
        setTitle(book.title || "");
        setAuthor(book.author || "");
        setDescription(book.description || "");
        setCoverUrl(book.image || "");
        setShowSearchResults(false);
    }


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

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left Section - Book Cover */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold">책 표지</h2>
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="책 표지"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-center ${coverUrl ? 'hidden' : ''}`}>
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">표지 이미지</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="coverUrl" className="text-sm font-medium">
                표지 URL
              </Label>
              <Input
                id="coverUrl"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                className="mt-1.5"
              />
            </div>

            {/* <Button variant="outline" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              AI로 표지 생성
            </Button> */}
          </div>

          {/* Right Section - Book Information */}
          <div className="space-y-6 rounded-lg border bg-card p-6">
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
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="책 제목을 입력하세요 (2글자 이상 자동 검색)"
                    className="pr-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isSearching && title.length >= 2 && (
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
                
                {/* 검색 결과 드롭다운 */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border bg-card shadow-lg max-h-80 overflow-y-auto">
                    {searchResults.map((book, index) => (
                      <div
                        key={book.isbn || `book-${index}`}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer border-b p-3 hover:bg-muted last:border-b-0 focus:bg-muted focus:outline-none"
                        onClick={() => handleSelectBook(book)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectBook(book);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {book.image && (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="h-12 w-9 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {book.title}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {book.author}
                            </div>
                            {book.publisher && (
                              <div className="text-xs text-muted-foreground/70 truncate">
                                {book.publisher}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
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

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  카테고리
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-help">자기계발</SelectItem>
                    <SelectItem value="dev">개발</SelectItem>
                    <SelectItem value="history">역사</SelectItem>
                    <SelectItem value="novel">소설</SelectItem>
                    <SelectItem value="psychology">심리학</SelectItem>
                    <SelectItem value="business">비즈니스</SelectItem>
                    <SelectItem value="science">과학</SelectItem>
                    <SelectItem value="essay">에세이</SelectItem>
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

            <div>
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

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/">취소</Link>
          </Button>
          <Button>
            <span className="mr-1">+</span>
            책 추가하기
          </Button>
        </div>
      </div>
    </div>
    )
}