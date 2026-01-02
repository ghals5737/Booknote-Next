'use client';

import { BookCard } from "@/components/dashboard/book-card";
import { BookmarkFilter } from "@/components/dashboard/bookmark-filter";
import { LibrarySearch } from "@/components/dashboard/library-search";
import { Button } from "@/components/ui/button";
import { BOOK_CATEGORY_LABELS, UserBookResponse } from "@/lib/types/book/book";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface MyLibrarySectionProps {
  books: UserBookResponse[];
}

export function MyLibrarySection({ books }: MyLibrarySectionProps) {
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
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl">내 서재</h2>
        <Button
          onClick={() => router.push('/book/add')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>책 추가</span>
        </Button>
      </div>
      
      {/* 검색바 */}
      <div className="mb-6">
        <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 책갈피 필터 */}
      <div className="mb-8">
        <BookmarkFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* 책 그리드 */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            cover={book.coverImage || ''}
            progress={book.progress}
            rating={book.rating || 0}
            noteCount={book.noteCnt}
          />
        ))}
      </div>

      {/* 검색 결과 없음 */}
      {filteredBooks.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">
            {searchQuery 
              ? '검색 결과가 없습니다.' 
              : '이 카테고리에 책이 없습니다.'}
          </p>
        </div>
      )}
    </section>
  );
}

