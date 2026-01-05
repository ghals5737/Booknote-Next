import { BookDetailTabs } from "@/components/book/book-detail-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authOptions } from '@/lib/auth';
import { BookDetailData } from "@/lib/types/book/book";
import { NoteResponsePage } from "@/lib/types/note/note";
import { QuoteResponsePage } from "@/lib/types/quote/quote";
import { ArrowLeft, BookOpen, Check, Clock, Edit3, Quote, Share2 } from "lucide-react";
import { getServerSession } from 'next-auth';
import Image from "next/image";
import Link from "next/link";
import { BookActionButtons } from "./BookActionButtons";
import { BookmarkButton } from "./BookmarkButton";
import { CompleteBookButton } from "./CompleteBookButton";
import { StarRatingWrapper } from "./StarRatingWrapper";

async function getBookDetailData(bookId: string): Promise<{
  bookDetail: BookDetailData;
  quotesData: QuoteResponsePage;
  notesData: NoteResponsePage;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
  
  try {
    // 병렬로 데이터 가져오기
    const [bookResponse, quotesResponse, notesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/user/books/${bookId}`, {
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
    console.log(':quotesData:',quotesData);
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

export default async function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params
  const initialData = await getBookDetailData(bookId);
  console.log('initialData', initialData);

  if (!initialData) {
    return <div>책을 찾을 수 없습니다.</div>
  }

  // 독서 시간 계산 (진행률 기반 추정)
  const readingTime = Math.floor(initialData.bookDetail.progress / 10);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 - 뒤로가기 + 액션 버튼들 */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </Link>

          {/* 상단 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <BookmarkButton bookId={bookId} isBookmarked={initialData.bookDetail.isBookmarked || false} />
            <Button variant="outline" size="icon" title="공유">
              <Share2 className="h-5 w-5" />
            </Button>
            <BookActionButtons bookId={bookId} />
          </div>
        </div>

        {/* 책 정보 헤더 */}
        <div className="mb-12 flex flex-col gap-8 md:flex-row">
            {/* 책 표지 */}
            <div className="flex-shrink-0">
              <div className="relative h-80 w-60 overflow-hidden rounded-xl bg-muted shadow-2xl">
                <Image 
                  src={initialData.bookDetail.coverImage || "/placeholder.svg"} 
                  alt={initialData.bookDetail.title} 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>

            {/* 책 정보 */}
            <div className="flex flex-1 flex-col">
              {/* 읽는 중 배지 */}
              {initialData.bookDetail.progress < 100 && (
                <div className="mb-2 inline-block self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  읽는 중
                </div>
              )}
              {initialData.bookDetail.progress >= 100 && (
                <div className="mb-2 inline-block self-start rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  완독
                </div>
              )}
              
              <h1 className="mb-2 font-serif text-4xl font-bold">{initialData.bookDetail.title}</h1>
              <p className="mb-6 text-xl text-muted-foreground">{initialData.bookDetail.author}</p>

              {/* 별점 */}
              {initialData.bookDetail.rating && initialData.bookDetail.rating > 0 && (
                <div className="mb-6 flex items-center gap-2">
                  <StarRatingWrapper
                    bookId={Number(initialData.bookDetail.id)}
                    initialRating={initialData.bookDetail.rating || 0}
                  />
                  <span className="text-sm text-muted-foreground">
                    {initialData.bookDetail.rating}.0
                  </span>
                </div>
              )}

              {/* 독서 진행률 */}
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium">독서 진행률</span>
                  <span className="text-2xl font-bold text-primary">{initialData.bookDetail.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${initialData.bookDetail.progress}%` }}
                  />
                </div>
                {initialData.bookDetail.totalPages > 0 && (
                  <div className="mt-2 text-right text-sm text-muted-foreground">
                    {initialData.bookDetail.currentPage} / {initialData.bookDetail.totalPages}
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-wrap gap-3">
                {initialData.bookDetail.progress < 100 ? (
                  <>
                    <Link href={`/book/${bookId}/read`} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg">
                      <BookOpen className="h-5 w-5" />
                      <span>이어서 읽기</span>
                    </Link>
                    <CompleteBookButton
                      bookId={bookId}
                      bookDetail={initialData.bookDetail}
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-6 py-3 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">완독한 책</span>
                  </div>
                )}
                <Link href={`/book/${bookId}/note/new`} className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-6 py-3 font-medium transition-all duration-200 hover:border-primary hover:bg-secondary/50">
                  <Edit3 className="h-5 w-5" />
                  <span>노트 작성</span>
                </Link>
                <Link href={`/book/${bookId}/quote/new`} className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-6 py-3 font-medium transition-all duration-200 hover:border-primary hover:bg-secondary/50">
                  <Quote className="h-5 w-5" />
                  <span>인용구 추가</span>
                </Link>
              </div>
            </div>
        </div>

        {/* 통계 카드 */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Edit3 className="h-4 w-4" />
              <span className="text-sm">작성한 노트</span>
            </div>
            <p className="text-3xl font-bold">{initialData.notesData.totalElements}</p>
          </Card>

          <Card className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Quote className="h-4 w-4" />
              <span className="text-sm">저장한 인용구</span>
            </div>
            <p className="text-3xl font-bold">{initialData.quotesData.totalElements}</p>
          </Card>

          <Card className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">독서 시간</span>
            </div>
            <p className="text-3xl font-bold">
              {readingTime}
              <span className="ml-1 text-base font-normal text-muted-foreground">시간</span>
            </p>
          </Card>
        </div>

        <BookDetailTabs
          bookId={initialData.bookDetail.id}
          noteCount={initialData.notesData.totalElements}
          quoteCount={initialData.quotesData.totalElements}
          initialNotes={initialData.notesData.content }
          initialQuotes={initialData.quotesData.content}
          bookDetail={initialData.bookDetail}
        />
      </main>
    </div>
  )
}
