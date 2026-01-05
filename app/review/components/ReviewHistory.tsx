"use client"

import { authenticatedApiRequest } from '@/lib/api/nextauth-api';
import { PageResponse } from '@/lib/types/pagenation/pagenation';
import { UIReviewItem } from '@/lib/types/review/review';
import { BookOpen, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

interface ReviewHistoryItem {
  id: number;
  reviewId: number;
  itemType: "NOTE" | "QUOTE";
  itemId: number;
  completed: boolean;
  completedTime: string | null;
  note: any;
  quote: any;
  bookTitle: string | null;
  lastReviewTime?: string | null;
  reviewCount?: number;
}

interface ReviewHistorySession {
  id: number;
  completed: boolean;
  plannedTime: string;
  completedTime: string | null;
  reviewItems: ReviewHistoryItem[];
}

interface ReviewHistoryResponse {
  success: boolean;
  status: number;
  message: string;
  data: PageResponse<ReviewHistorySession>;
  timestamp: string | null;
}

// 날짜별로 그룹화
function groupByDate(items: UIReviewItem[]): Array<[string, UIReviewItem[]]> {
  const groups: Record<string, UIReviewItem[]> = {};
  
  items.forEach(item => {
    const timeToUse = item.lastReviewTime || item.completedTime;
    if (!timeToUse) return;
    
    const date = new Date(timeToUse);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  return Object.entries(groups).sort((a, b) => {
    const timeA = a[1][0]?.lastReviewTime || a[1][0]?.completedTime || '';
    const timeB = b[1][0]?.lastReviewTime || b[1][0]?.completedTime || '';
    return new Date(timeB || 0).getTime() - new Date(timeA || 0).getTime();
  });
}

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  return {
    full: `${year}년 ${month}월 ${day}일`,
    short: `${month}/${day}`,
    weekday: weekday,
  };
};

function convertHistoryToUI(items: ReviewHistoryItem[]): UIReviewItem[] {
  return items.map(item => {
    const content = item.itemType === "NOTE" 
      ? (item.note?.content || item.note?.title || "")
      : (item.quote?.content || "");
    
    return {
      id: item.id,
      reviewId: item.reviewId,
      type: item.itemType,
      content,
      source: item.bookTitle || "알 수 없음",
      page: item.quote?.page,
      date: item.completedTime || new Date().toISOString().split('T')[0],
      tags: item.note?.tagList || [],
      title: item.note?.title,
      dueDate: item.completedTime || undefined,
      status: "completed" as const,
      itemId: item.itemId,
      bookId: item.note?.bookId || item.quote?.bookId,
      completedTime: item.completedTime,
      lastReviewTime: item.lastReviewTime || item.completedTime || null,
      reviewCount: item.reviewCount,
    };
  });
}

export function ReviewHistory() {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'all' | 'note' | 'quote'>('all');
  const isInitialized = useRef(false);

  const { data, error, isLoading } = useSWR<ReviewHistoryResponse>(
    '/api/v1/reviews/history?page=0&size=100',
    async (url: string) => {
      const response = await authenticatedApiRequest<PageResponse<ReviewHistorySession>>(url);
      return {
        success: true,
        status: 200,
        message: '',
        data: response.data,
        timestamp: null,
      } as ReviewHistoryResponse;
    }
  );

  const allItems = useMemo(() => {
    if (!data?.data?.content) return [];
    
    const items: UIReviewItem[] = [];
    data.data.content.forEach(session => {
      items.push(...convertHistoryToUI(session.reviewItems));
    });
    
    return items.sort((a, b) => {
      const timeA = (a.lastReviewTime || a.completedTime) ? new Date(a.lastReviewTime || a.completedTime || '').getTime() : 0;
      const timeB = (b.lastReviewTime || b.completedTime) ? new Date(b.lastReviewTime || b.completedTime || '').getTime() : 0;
      return timeB - timeA;
    });
  }, [data]);

  // 필터링
  const filteredItems = useMemo(() => {
    if (selectedTab === 'all') return allItems;
    return allItems.filter(item => item.type === selectedTab.toUpperCase());
  }, [allItems, selectedTab]);

  // 날짜별 그룹화
  const groupedByDate = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  // 첫 번째 날짜를 기본적으로 확장 (초기 로드 시에만)
  useEffect(() => {
    if (groupedByDate.length > 0 && !isInitialized.current) {
      setExpandedSessions(new Set([groupedByDate[0][0]]));
      isInitialized.current = true;
    }
  }, [groupedByDate]);

  const toggleSession = (dateKey: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  // 통계 계산
  const totalReviews = allItems.length;
  const totalDays = groupedByDate.length;
  const noteCount = allItems.filter(i => i.type === "NOTE").length;
  const quoteCount = allItems.filter(i => i.type === "QUOTE").length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-32 mb-4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
          <p className="text-destructive mb-4">데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B7355]/10 backdrop-blur-sm">
            <History className="h-6 w-6 text-[#8B7355]" />
          </div>
        </div>
        <h1 className="mb-2 font-serif text-2xl text-foreground">복습 히스토리</h1>
        <p className="text-sm text-muted-foreground">
          꾸준히 복습한 나의 발자취를 살펴보세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-foreground">{totalReviews}</div>
          <div className="text-xs text-muted-foreground">전체 복습</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-foreground">{totalDays}</div>
          <div className="text-xs text-muted-foreground">복습한 날</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm">
          <div className="mb-1 text-2xl font-bold text-foreground">
            {totalReviews > 0 ? Math.round((totalReviews / totalDays) * 10) / 10 : 0}
          </div>
          <div className="text-xs text-muted-foreground">평균 / 일</div>
        </div>
      </div>

      {/* 탭 필터 */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          onClick={() => setSelectedTab('all')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            selectedTab === 'all'
              ? 'bg-[#8B7355] text-white shadow-sm'
              : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
          }`}
        >
          전체 ({totalReviews})
        </button>
        <button
          onClick={() => setSelectedTab('note')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            selectedTab === 'note'
              ? 'bg-[#8B7355] text-white shadow-sm'
              : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
          }`}
        >
          노트 ({noteCount})
        </button>
        <button
          onClick={() => setSelectedTab('quote')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            selectedTab === 'quote'
              ? 'bg-[#8B7355] text-white shadow-sm'
              : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
          }`}
        >
          인용구 ({quoteCount})
        </button>
      </div>

      {/* 복습 세션 목록 */}
      {groupedByDate.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border/50 bg-card/30 p-16 text-center backdrop-blur-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <History className="h-8 w-8 text-muted-foreground/40" />
            </div>
          </div>
          <p className="mb-2 font-serif text-lg text-foreground">아직 복습 기록이 없습니다</p>
          <p className="text-sm text-muted-foreground">
            노트를 작성하고 복습을 시작해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateKey, items]) => {
            const isExpanded = expandedSessions.has(dateKey);
            const dateInfo = formatDate(dateKey);
            
            return (
              <div
                key={dateKey}
                className="overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
              >
                {/* 세션 헤더 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSession(dateKey);
                  }}
                  className="w-full border-b border-border/50 bg-background/30 p-5 text-left transition-colors hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[#8B7355]/10">
                        <span className="text-xs font-medium text-[#8B7355]">{dateInfo.weekday}</span>
                        <span className="text-lg font-bold text-[#8B7355]">{dateInfo.short.split('/')[1]}</span>
                      </div>
                      <div>
                        <h3 className="mb-1 font-serif text-lg text-foreground">{dateInfo.full}</h3>
                        <p className="text-sm text-muted-foreground">
                          {items.length}개 복습 완료
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {/* 세션 아이템 목록 */}
                {isExpanded && (
                  <div className="divide-y divide-border/50">
                    {items.map((item) => {
                      return (
                        <div key={item.id} className="p-5 transition-colors hover:bg-background/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="mb-3 font-serif leading-relaxed text-foreground line-clamp-2">
                                "{item.content}"
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{item.source}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

