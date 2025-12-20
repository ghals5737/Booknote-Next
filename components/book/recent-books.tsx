import { BookCard } from "@/components/book/book-card";
import { UserBookResponse } from "../../lib/types/book/book";

interface RecentBooksProps {
  books: UserBookResponse[];
}

export function RecentBooks({ books }: RecentBooksProps) {
  // 대시보드에서 내려온 전체 책 목록 중 최근 책 몇 권만 선택
  const recentBooks = books.slice(0, 3).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    cover: book.coverImage || "/placeholder.svg",
    progress: book.progress,
    currentPage: book.currentPage,
    totalPages: book.totalPages,
    note: `${book.noteCnt}개 노트`,
  }));

  if (recentBooks.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">최근 읽은 책</h2>
        <a href="#" className="text-sm font-medium text-primary hover:underline">
          전체 보기
        </a>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recentBooks.map((book) => (
          <BookCard key={book.id} book={book} variant="recent" />
        ))}
      </div>
    </div>
  )
}
