'use client';

import { Greeting } from "@/components/dashboard/greeting";
import { MyLibrarySection } from "@/components/dashboard/my-library-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { QuoteOfTheDay } from "@/components/dashboard/quote-of-the-day";
import { ReadingBooksSection } from "@/components/dashboard/reading-books-section";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UserBookResponsePage } from "@/lib/types/book/book";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";
import { getReadingBooks } from "@/lib/utils/dashboard-utils";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface DashboardClientProps {
    booksData: UserBookResponsePage;
    statisticsData: StatisticsResponse | null;
}

export default function DashboardClient({ booksData, statisticsData }: DashboardClientProps) {
    const router = useRouter();

    // 독서 타이머 시작 핸들러 (bookId 받는 버전)
    const handleStartTimerForBook = (bookId: number) => {
        // TODO: 독서 타이머 기능 구현
        console.log('독서 타이머 시작:', bookId);
        // 예: router.push(`/book/${bookId}?timer=true`);
    };

    // QuickActions 핸들러들
    const handleContinueReading = () => {
        const firstReadingBook = readingBooks[0];
        if (firstReadingBook) {
            router.push(`/book/${firstReadingBook.id}`);
        }
    };

    const handleWriteNote = () => {
        const firstReadingBook = readingBooks[0];
        if (firstReadingBook) {
            router.push(`/book/${firstReadingBook.id}/note/new`);
        } else {
            // 읽고 있는 책이 없으면 대시보드나 노트 목록으로 이동
            router.push('/dashboard');
        }
    };

    const handleStartTimer = () => {
        const firstReadingBook = readingBooks[0];
        if (firstReadingBook) {
            handleStartTimerForBook(firstReadingBook.id);
        } else {
            console.log('독서 타이머 시작 (책 없음)');
        }
    };

    const handlePlayMusic = () => {
        // TODO: 독서 분위기 음악 재생 기능 구현
        console.log('독서 분위기 음악 재생');
    };

    const readingBooks = useMemo(() => getReadingBooks(booksData.content), [booksData.content]);
    const currentBook = readingBooks.length > 0 ? {
        title: readingBooks[0].title,
        progress: readingBooks[0].progress
    } : undefined;

    // 오늘의 인용구 (목업 데이터 - 추후 API로 교체)
    const todayQuote = useMemo(() => {
        // 실제로는 API에서 가져와야 함
        return {
            quote: "독서는 한 사람의 마음을 다른 시대와 장소로 데려다주는 마법이다.",
            author: "메이슨 쿨리",
            bookTitle: "독서의 기술"
        };
    }, []);

    // 최근 활동 데이터 변환 (목업 데이터 - 추후 API로 교체)
    const recentActivities = useMemo(() => {
        // booksData에서 최근 활동 생성 (실제로는 API에서 가져와야 함)
        const activities = booksData.content
            .slice(0, 5)
            .map((book, index) => {
                const activityTypes: Array<'note' | 'reading' | 'finished'> = ['note', 'reading', 'finished'];
                const type = activityTypes[index % activityTypes.length];
                
                return {
                    id: book.id,
                    type,
                    bookTitle: book.title,
                    bookCover: book.coverImage || '',
                    content: type === 'note' ? '독서 노트를 작성했습니다.' : undefined,
                    pages: type === 'reading' ? Math.floor(Math.random() * 50) + 10 : undefined,
                    timestamp: book.updateDate || book.startDate || new Date().toISOString()
                };
            });

        return activities.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [booksData.content]);


    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* 인사말 섹션 */}
            <Greeting userName="독서가" />

            {/* 통계 카드 섹션 */}
            <StatsCards statisticsData={statisticsData} />

            {/* QuickActions 섹션 */}
            <div className="mb-8">
                <QuickActions
                    onContinueReading={handleContinueReading}
                    onWriteNote={handleWriteNote}
                    onStartTimer={handleStartTimer}
                    onPlayMusic={handlePlayMusic}
                    currentBook={currentBook}
                />
            </div>

            {/* 지금 읽던 책 이어서 읽기 섹션 */}
            <ReadingBooksSection 
                books={readingBooks} 
                onStartTimer={handleStartTimerForBook}
            />

            {/* 오늘의 문학 인용구 */}
            <div className="mb-12">
                <QuoteOfTheDay {...todayQuote} />
            </div>

            {/* 최근 활동 */}
            <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl">최근 활동</h2>
                    <button className="text-sm text-primary hover:underline">
                        전체보기
                    </button>
                </div>
                <RecentActivity activities={recentActivities} />
            </section>

            {/* 내 서재 */}
            <MyLibrarySection books={booksData.content} />
        </main>
    );
}