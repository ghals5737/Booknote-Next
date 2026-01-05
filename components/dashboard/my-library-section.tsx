'use client';

import { BookCard } from "@/components/dashboard/book-card";
import { LibrarySearch } from "@/components/dashboard/library-search";
import { BOOK_CATEGORY_LABELS, UserBookResponse } from "@/lib/types/book/book";
import { BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface MyLibrarySectionProps {
  books: UserBookResponse[];
  onBookClick?: (bookId: number) => void;
}

export function MyLibrarySection({ books, onBookClick }: MyLibrarySectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

  // 카테고리 목록 생성
  const categories = useMemo(() => {
    const allCategories = ['전체', ...Object.values(BOOK_CATEGORY_LABELS)];
    return allCategories;
  }, []);

  // 필터링된 책 목록
  const filteredBooks = useMemo(() => {
    let filtered = books;

    // 카테고리 필터
    if (activeCategory !== '전체') {
      const categoryKey = Object.keys(BOOK_CATEGORY_LABELS).find(
        key => BOOK_CATEGORY_LABELS[key as keyof typeof BOOK_CATEGORY_LABELS] === activeCategory
      );
      if (categoryKey) {
        filtered = filtered.filter(book => book.category === categoryKey);
      }
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        book => 
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [books, activeCategory, searchQuery]);

  return (
    <>
      {/* 읽는 중인 책 */}
      {books.length > 0 && (
        <section>
          {/* 헤더 with 통계 */}
          <div className="mb-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-end gap-6">
                <h2 className="font-serif text-3xl font-semibold">
                  내 서재
                </h2>
              </div>
              <button
                onClick={() => router.push('/book/add')}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                <span>책 추가하기</span>
              </button>
            </div>

            {/* 검색 & 필터 */}
            <div className="space-y-4">
              {/* 검색바 */}
              <div className="relative">
                <LibrarySearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              {/* 카테고리 필터 - 심플한 탭 */}
              <div className="flex gap-2 border-b border-border/40">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`relative pb-3 px-4 text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                    {activeCategory === category && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 책 그리드 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  cover={book.coverImage || ''}
                  progress={book.progress}
                  rating={book.rating || 0}
                  noteCount={book.noteCnt || 0}
                  quoteCount={book.quoteCnt || 0}
                  onClick={() => router.push(`/book/${book.id}`)}
                />
              </div>
            ))}
          </div>

          {/* 검색 결과 없음 */}
          {filteredBooks.length === 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/30 py-16 text-center backdrop-blur-sm animate-in fade-in">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold">
                {searchQuery
                  ? "검색 결과가 없습니다"
                  : "이 카테고리에 책이 없습니다"}
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                {searchQuery
                  ? "다른 키워드로 검색해보세요"
                  : "새로운 책을 추가해보세요"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  검색 초기화
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* 데이터가 없을 때 */}
      {books.length === 0 && (
        <div className="rounded-xl border border-border/50 bg-card/50 py-20 text-center backdrop-blur-sm animate-in fade-in">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="mb-2 text-muted-foreground">
            아직 등록된 책이 없습니다
          </p>
          <p className="text-sm text-muted-foreground/60">
            내 서재에서 새로운 책을 추가해보세요
          </p>
        </div>
      )}
    </>
  );
}

