import { authenticatedApiRequest } from '@/lib/api/nextauth-api';
import useSWR from 'swr';
import { DashboardInfoResponse, DashboardOptions, DashboardStats } from '../lib/types/dashboard/dashboard';
import { useNextAuth } from './use-nextauth';

// API 응답을 컴포넌트에서 사용하기 쉬운 형태로 변환
function transformDashboardData(response: DashboardInfoResponse): DashboardStats {
  // Mock 최근 활동 데이터 생성
  const mockRecentActivity = [
    {
      type: 'note_created' as const,
      bookTitle: '아토믹 해빗',
      timestamp: new Date().toISOString()
    },
    {
      type: 'book_added' as const,
      bookTitle: '클린 코드',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      type: 'quote_added' as const,
      bookTitle: '아토믹 해빗',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  return {
    books: {
      total: response.bookCount,
      reading: response.bookCount - response.finishedBookCount, // 전체 - 완독 = 읽는 중
      finished: response.finishedBookCount,
    },
    notes: {
      total: response.noteCount,
      thisMonth: response.noteCount, // 실제로는 월별 데이터가 필요
    },
    quotes: {
      total: response.quoteCount,
      thisMonth: response.quoteCount, // 실제로는 월별 데이터가 필요
    },
    readingTime: {
      total: response.totalReadingTime,
      thisMonth: response.totalReadingTime, // 실제로는 월별 데이터가 필요
    },
    recentActivity: mockRecentActivity,
    readingGoals: {
      booksPerYear: 12,
      booksThisYear: response.finishedBookCount,
      pagesPerDay: 20,
      pagesToday: 0, // 실제로는 일별 데이터가 필요
    }
  };
}

// SWR fetcher 함수 (NextAuth.js 기반)
const fetcher = async (url: string) => {
  try {
    const response = await authenticatedApiRequest<DashboardInfoResponse>(url);
    return transformDashboardData(response.data);
  } catch (error) {
    console.error('[Dashboard Fetcher] Error:', error);
    throw error;
  }
};

// 대시보드 통계 조회 훅
export function useDashboardStats(options: DashboardOptions = {}) {
  const { isAuthenticated } = useNextAuth();
  
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams();
  if (options.startDate) queryParams.append('startDate', options.startDate);
  if (options.endDate) queryParams.append('endDate', options.endDate);
  if (options.includeBooks !== undefined) queryParams.append('includeBooks', options.includeBooks.toString());
  if (options.includeNotes !== undefined) queryParams.append('includeNotes', options.includeNotes.toString());
  if (options.includeQuotes !== undefined) queryParams.append('includeQuotes', options.includeQuotes.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/v1/stats/dashboard${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    isAuthenticated ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30초간 중복 요청 방지
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

// 캐시 무효화 함수
export const invalidateDashboardCache = async () => {
  try {
    await mutate('/api/v1/stats/dashboard');
    console.log('[Cache] Dashboard cache invalidated successfully');
  } catch (error) {
    console.error('[Cache] Error invalidating dashboard cache:', error);
  }
};