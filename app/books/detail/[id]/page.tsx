import { authOptions } from '@/lib/auth';
import { BookDetailData } from '@/lib/types/book/book';
import { NoteResponsePage } from '@/lib/types/note/note';
import { QuoteResponsePage } from '@/lib/types/quote/quote';
import { getServerSession } from 'next-auth';
import BookDetailClient from "./BookDetailClient";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// SSR로 데이터 페칭
async function getBookDetailData(bookId: string): Promise<{
  bookDetail: BookDetailData;
  quotesData: QuoteResponsePage;
  notesData: NoteResponsePage;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';
  
  try {
    // 병렬로 데이터 가져오기
    const [bookResponse, quotesResponse, notesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }),
      fetch(`${baseUrl}/api/v1/quotes/user/books/${bookId}?page=0&size=100&sort=created_at`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }),
      fetch(`${baseUrl}/api/v1/notes/user/books/${bookId}?page=0&size=100&sort=created_at`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      })
    ]);

    if (!bookResponse.ok) {
      throw new Error('책 정보를 가져오는데 실패했습니다.');
    }

    const bookDetail = await bookResponse.json();
    const quotesData = quotesResponse.ok ? await quotesResponse.json() : { content: [], totalElements: 0, totalPages: 0 };
    const notesData = notesResponse.ok ? await notesResponse.json() : { content: [], totalElements: 0, totalPages: 0 };

    return {
      bookDetail: bookDetail.data || bookDetail,
      quotesData: quotesData.data || quotesData,
      notesData: notesData.data || notesData,
    };
  } catch (error) {
    console.error('Book detail data fetch error:', error);
    throw new Error('데이터를 가져오는데 실패했습니다.');
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  
  try {
    const initialData = await getBookDetailData(id);
    return (
      <BookDetailClient 
        bookId={id} 
        initialData={initialData}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">오류가 발생했습니다</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
          </p>
          <button 
            onClick={() => globalThis.location.href = '/books'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            서재로 돌아가기
          </button>
        </div>
      </div>
    );
  }
}