import { authOptions } from '@/lib/auth'
import { BookDetailData } from "@/lib/types/book/book"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { getServerSession } from 'next-auth'
import QuoteDetailClient from "./QuoteDetailClient"

async function getQuoteDetailData(bookId: string, quoteId: string): Promise<{
  bookDetail: BookDetailData;
  quoteDetail: QuoteResponse;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
  
  try {
    // 병렬로 데이터 가져오기
    const [bookResponse, quoteResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/user/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }),
      fetch(`${baseUrl}/api/v1/quotes/${quoteId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      })
    ]);

    if (!bookResponse.ok) {
      throw new Error('책 정보를 가져오는데 실패했습니다.');
    }

    if (!quoteResponse.ok) {
      throw new Error('인용구 정보를 가져오는데 실패했습니다.');
    }

    const bookDetail = await bookResponse.json();
    const quoteDetail = await quoteResponse.json();

    return {
      bookDetail: bookDetail.data || bookDetail,
      quoteDetail: quoteDetail.data || quoteDetail,
    };
  } catch (error) {
    console.error('Quote detail data fetch error:', error);
    throw new Error('데이터를 가져오는데 실패했습니다.');
  }
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ bookId: string; quoteId: string }>
}) {
  const { bookId, quoteId } = await params
  const initialData = await getQuoteDetailData(bookId, quoteId)

  if (!initialData) {
    return <div>인용구를 찾을 수 없습니다.</div>
  }

  return (
    <QuoteDetailClient quoteDetail={initialData.quoteDetail} bookDetail={initialData.bookDetail} />
  )
}

