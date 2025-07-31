import { BookDetailData, NoteData, QuoteData } from "@/lib/types/book/book";
import BookDetailClient from "./BookDetailClient";

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

async function getBookDetail(bookId: string): Promise<BookDetailData> {
  const response = await fetch(`http://localhost:9377/api/v1/users/1/books/${bookId}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch book detail');
  }
  
  const data = await response.json();
  return data.data;
}

async function getBookQuotes(bookId: string): Promise<QuoteData[]> {
  const response = await fetch(`http://localhost:9377/api/v1/quotes/users/1/books/${bookId}?page=0&size=100&sort=id,desc`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch book quotes');
  }
  
  const data = await response.json();
  return data.data.content;
}

async function getBookNotes(bookId: string): Promise<NoteData[]> {
  const response = await fetch(`http://localhost:9377/api/v1/notes/users/1/books/${bookId}?page=0&size=100&sort=id,desc`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch book notes');
  }
  
  const data = await response.json();
  return data.data.content;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  try {
    const [bookDetail, quotes, notes] = await Promise.all([
      getBookDetail(params.id),
      getBookQuotes(params.id),
      getBookNotes(params.id)
    ]);

    return (
      <BookDetailClient 
        bookDetail={bookDetail}
        quotes={quotes}
        notes={notes}
        bookId={params.id}
      />
    );
  } catch (error) {
    console.error('Error fetching book detail:', error);
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              책 정보를 불러올 수 없습니다
            </h1>
            <p className="text-muted-foreground">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }
}