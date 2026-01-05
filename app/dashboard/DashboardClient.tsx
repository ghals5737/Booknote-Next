'use client';

import { Greeting } from "@/components/dashboard/greeting";
import { MyLibrarySection } from "@/components/dashboard/my-library-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { QuoteOfTheDay } from "@/components/dashboard/quote-of-the-day";
import { ReadingTimer } from "@/components/dashboard/reading-timer";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { useToast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { UserBookResponsePage } from "@/lib/types/book/book";
import { ActivityResponse } from "@/lib/types/dashboard/dashboard";
import { GoalsResponse } from "@/lib/types/goal/goal";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";
import { CurrentTimerResponse, StartTimerRequest, StartTimerResponse } from "@/lib/types/timer/timer";
import { getReadingBooks } from "@/lib/utils/dashboard-utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DashboardClientProps {
    booksData: UserBookResponsePage;
    statisticsData: StatisticsResponse | null;
    goalsData: GoalsResponse | null;
    recentActivities: ActivityResponse[];
    userName?: string | null;
}

export default function DashboardClient({ booksData, statisticsData, goalsData, recentActivities, userName }: DashboardClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isStartingTimer, setIsStartingTimer] = useState(false);
    const [currentTimer, setCurrentTimer] = useState<CurrentTimerResponse | null>(null);
    const [isLoadingTimer, setIsLoadingTimer] = useState(true);
    const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

    const readingBooks = useMemo(() => getReadingBooks(booksData.content), [booksData.content]);
    
    // 선택된 책이 없으면 첫 번째 읽고 있는 책을 기본값으로 설정
    useEffect(() => {
        if (selectedBookId === null && readingBooks.length > 0) {
            setSelectedBookId(readingBooks[0].id);
        }
    }, [readingBooks, selectedBookId]);

    // 현재 실행 중인 타이머 조회
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const fetchCurrentTimer = async () => {
            try {
                setIsLoadingTimer(true);
                const result = await authenticatedApiRequest<CurrentTimerResponse | null>('/api/v1/timer/current');
                
                if (result.data) {
                    setCurrentTimer(result.data);
                    // 타이머가 있으면 5초마다 갱신 (interval이 없을 때만 시작)
                    if (!intervalId) {
                        intervalId = setInterval(fetchCurrentTimer, 5000);
                    }
                } else {
                    setCurrentTimer(null);
                    // 타이머가 없으면 interval 중지
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }
            } catch (error) {
                // 404는 정상 (실행 중인 타이머가 없는 경우)
                if (error instanceof Error) {
                    const errorWithStatus = error as Error & { status?: number; isNotFound?: boolean }
                    const isNotFound = errorWithStatus.isNotFound || 
                                      errorWithStatus.status === 404 ||
                                      error.message.includes('404') || 
                                      error.message.includes('실행 중인 타이머가 없습니다');
                    
                    if (isNotFound) {
                        setCurrentTimer(null);
                        // 타이머가 없으면 interval 중지
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                        // 404는 정상 케이스이므로 로그를 남기지 않음
                        setIsLoadingTimer(false);
                        return;
                    }
                }
                
                // 404가 아닌 다른 에러만 로그에 남김
                console.error('현재 타이머 조회 오류:', error);
            } finally {
                setIsLoadingTimer(false);
            }
        };

        // 초기 조회 (타이머가 없으면 interval을 시작하지 않음)
        fetchCurrentTimer();
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    // 독서 타이머 시작 핸들러 (bookId 받는 버전)
    const handleStartTimerForBook = async (bookId: number) => {
        if (isStartingTimer) return;
        
        try {
            setIsStartingTimer(true);
            console.log('[타이머] 시작 API 호출:', bookId);
            
            const requestBody: StartTimerRequest = {
                bookId,
            };

            const result = await authenticatedApiRequest<StartTimerResponse>('/api/v1/timer/start', {
                method: 'POST',
                body: JSON.stringify(requestBody),
            });
            
            console.log('[타이머] 시작 성공:', result);
            
            // 현재 타이머 상태 업데이트
            // StartTimerResponse에는 bookCover가 없으므로 readingBooks에서 찾아서 추가
            const book = readingBooks.find(b => b.id === result.data.bookId);
            setCurrentTimer({
                timerId: result.data.timerId,
                bookId: result.data.bookId,
                bookTitle: result.data.bookTitle,
                bookCover: book?.coverImage || undefined,
                startTime: result.data.startTime,
                targetMinutes: result.data.targetMinutes,
                elapsedMinutes: 0,
                status: result.data.status,
            });
            
            toast({
                title: '타이머 시작',
                description: `${result.data.bookTitle}의 독서 타이머를 시작했습니다.`,
            });
        } catch (error) {
            console.error('[타이머] 시작 오류:', error);
            toast({
                title: '오류',
                description: error instanceof Error ? error.message : '타이머 시작에 실패했습니다.',
                variant: 'destructive',
            });
        } finally {
            setIsStartingTimer(false);
        }
    };

    // QuickActions 핸들러들
    const handleContinueReading = (bookId?: number) => {
        // 타이머가 실행 중이면 책 변경 불가
        if (currentTimer) {
            toast({
                title: '알림',
                description: '타이머가 실행 중일 때는 책을 변경할 수 없습니다.',
                variant: 'default',
            });
            return;
        }

        if (bookId) {
            setSelectedBookId(bookId);
        } else {
            // bookId가 없으면 현재 선택된 책 또는 첫 번째 책으로 책 상세 페이지로 이동
            const targetBookId = selectedBookId || readingBooks[0]?.id;
            if (targetBookId) {
                router.push(`/book/${targetBookId}`);
            }
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

    const handleStartTimer = async () => {
        console.log('[타이머] 버튼 클릭됨', { 
            isStartingTimer, 
            selectedBookId,
            readingBooksCount: readingBooks.length,
            readingBooks: readingBooks.map(b => ({ id: b.id, title: b.title, progress: b.progress }))
        });
        
        if (isStartingTimer) {
            console.log('[타이머] 이미 시작 중...');
            return;
        }
        
        // 선택된 책이 있으면 그 책으로, 없으면 첫 번째 책으로 타이머 시작
        const targetBookId = selectedBookId || readingBooks[0]?.id;
        if (targetBookId) {
            const targetBook = readingBooks.find(b => b.id === targetBookId);
            console.log('[타이머] 책 찾음:', targetBookId, targetBook?.title);
            await handleStartTimerForBook(targetBookId);
        } else {
            console.log('[타이머] 읽고 있는 책 없음');
            toast({
                title: '알림',
                description: '읽고 있는 책이 없습니다. 먼저 책을 추가해주세요.',
                variant: 'default',
            });
        }
    };

    const handlePlayMusic = () => {
        // 독서 분위기 음악 재생 기능은 현재 구현되지 않았습니다.
        // 향후 구현 예정입니다.
    };

    // 타이머 종료 후 콜백
    const handleTimerStop = () => {
        setCurrentTimer(null);
        // 타이머 종료 시 interval은 자동으로 중지됨 (fetchCurrentTimer에서 404 처리)
    };
    
    // 타이머가 종료되면 선택된 책은 유지 (변경하지 않음)

    // 타이머 시작 시 interval 재시작을 위한 effect
    useEffect(() => {
        if (!currentTimer) return;

        // 타이머가 시작되면 5초마다 갱신
        const intervalId = setInterval(async () => {
            try {
                const result = await authenticatedApiRequest<CurrentTimerResponse | null>('/api/v1/timer/current');
                
                if (result.data) {
                    setCurrentTimer(result.data);
                } else {
                    setCurrentTimer(null);
                }
            } catch (error) {
                // 404는 정상 (타이머가 종료된 경우)
                if (error instanceof Error) {
                    const errorWithStatus = error as Error & { status?: number; isNotFound?: boolean }
                    const isNotFound = errorWithStatus.isNotFound || 
                                      errorWithStatus.status === 404 ||
                                      error.message.includes('404') || 
                                      error.message.includes('실행 중인 타이머가 없습니다');
                    
                    if (isNotFound) {
                        setCurrentTimer(null);
                        return;
                    }
                }
                console.error('타이머 갱신 오류:', error);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [currentTimer]);
    // 현재 선택된 책 정보
    const currentBook = useMemo(() => {
        if (selectedBookId === null) return undefined;
        const book = readingBooks.find(b => b.id === selectedBookId);
        return book ? {
            title: book.title,
            progress: book.progress
        } : undefined;
    }, [selectedBookId, readingBooks]);

    // 오늘의 인용구 (목업 데이터 - 추후 API로 교체)
    const todayQuote = useMemo(() => {
        // 실제로는 API에서 가져와야 함
        return {
            quote: "독서는 한 사람의 마음을 다른 시대와 장소로 데려다주는 마법이다.",
            author: "메이슨 쿨리",
            bookTitle: "독서의 기술"
        };
    }, []);



    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* 인사말 섹션 */}
            <Greeting userName={userName || undefined} />

            {/* 통계 카드 섹션 */}
            <div className="mt-8">
                <StatsCards statisticsData={statisticsData} goalsData={goalsData} />
            </div>

            {/* 실행 중인 타이머 */}
            {!isLoadingTimer && currentTimer && (
                <div className="mb-12">
                    <ReadingTimer timer={currentTimer} onStop={handleTimerStop} />
                </div>
            )}

            {/* QuickActions 섹션 */}
            <div className="mb-12">
                <QuickActions
                    onContinueReading={handleContinueReading}
                    onWriteNote={handleWriteNote}
                    onStartTimer={handleStartTimer}
                    onPlayMusic={handlePlayMusic}
                    currentBook={currentBook}
                    readingBooks={readingBooks.map(book => ({
                        id: book.id,
                        title: book.title,
                        progress: book.progress
                    }))}
                    isTimerRunning={!!currentTimer}
                    selectedBookId={selectedBookId}
                />
            </div>

            {/* 오늘의 문학 인용구 */}
            <div className="mb-16">
                <QuoteOfTheDay {...todayQuote} />
            </div>

            {/* 최근 활동 */}
            <section className="mb-20">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="font-serif font-semibold text-2xl">최근 활동</h2>
                    <button 
                        onClick={() => router.push('/dashboard/activities')}
                        className="text-sm text-primary hover:underline transition-colors"
                    >
                        전체 활동 보기
                    </button>
                </div>
                <RecentActivity activities={recentActivities} />
            </section>

            {/* 내 서재 */}
            <MyLibrarySection books={booksData.content} />
        </main>
    );
}