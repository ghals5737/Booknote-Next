import { BookDetailTabs } from "@/components/book/book-detail-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authOptions } from '@/lib/auth';
import { BookDetailData } from "@/lib/types/book/book";
import { NoteResponsePage } from "@/lib/types/note/note";
import { QuoteResponsePage } from "@/lib/types/quote/quote";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />내 서재로 돌아가기
        </Link>

        <Card className="mb-8 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-shrink-0">
              <div className="relative h-80 w-56 overflow-hidden rounded-lg bg-muted shadow-lg">
                <Image src={initialData.bookDetail.coverImage || "/placeholder.svg"} alt={initialData.bookDetail.title} fill className="object-cover" />
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-balance">{initialData.bookDetail.title}</h1>
                  <p className="mb-3 text-lg text-muted-foreground">{initialData.bookDetail.author}</p>
                </div>
                <BookActionButtons bookId={bookId} />
              </div>

              <div className="mb-6 grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="mb-1 text-3xl font-bold text-primary">{initialData.bookDetail.progress}%</div>
                  <div className="text-xs text-muted-foreground">진행률</div>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold text-green-600">{initialData.notesData.totalElements}</div>
                  <div className="text-xs text-muted-foreground">노트</div>
                </div>
                <div>
                  <div className="mb-1 text-3xl font-bold text-purple-600">{initialData.bookDetail.currentPage}</div>
                  <div className="text-xs text-muted-foreground">현재 페이지</div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-center">
                    <StarRatingWrapper
                      bookId={Number(initialData.bookDetail.id)}
                      initialRating={initialData.bookDetail.rating || 0}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">평점</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                    style={{ width: `${initialData.bookDetail.progress}%` }}
                  />
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {initialData.bookDetail.currentPage} / {initialData.bookDetail.totalPages}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* 완독 버튼 (진행률이 100% 미만일 때만 표시) */}
                {initialData.bookDetail.progress < 100 && (
                  <CompleteBookButton
                    bookId={bookId}
                    bookDetail={initialData.bookDetail}
                  />
                )}
                
                <div className="flex gap-2">
                  <Link href={`/book/${bookId}/note/new`} className="flex-1">
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      노트 추가
                    </Button>
                  </Link>
                  <Link href={`/book/${bookId}/quote/new`} className="flex-1">
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      인용구 추가
                    </Button>
                  </Link>
                  <BookmarkButton bookId={bookId} isBookmarked={initialData.bookDetail.isBookmarked || false} />
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    공유
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <BookDetailTabs
          bookId={initialData.bookDetail.id}
          noteCount={initialData.notesData.totalElements}
          quoteCount={initialData.quotesData.totalElements}
          initialNotes={initialData.notesData.content }
          initialQuotes={initialData.quotesData.content}
          bookDetail={initialData.bookDetail}
        />

        <Button size="lg" className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg" aria-label="노트 추가">
          <Plus className="h-6 w-6" />
        </Button>
      </main>
    </div>
  )
}
