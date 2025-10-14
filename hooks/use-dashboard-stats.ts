import { getStoredTokens, isTokenExpired, storeTokens } from '@/lib/api/token';
import useSWR from 'swr';
import { DashboardInfoResponse, DashboardOptions, DashboardStats } from '../lib/types/dashboard/dashboard';
import { useNextAuth } from './use-next-auth';


// 토큰 갱신 함수
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
}

// API 응답을 컴포넌트에서 사용하기 쉬운 형태로 변환
function transformDashboardData(response: DashboardInfoResponse): DashboardStats {
  return {
    books: {
      total: response.bookCount,
      reading: response.bookCount - response.finishedBookCount, // 전체 - 완독 = 읽는 중
      finished: response.finishedBookCount,
    },
    notes: {
      total: response.noteCount,
      important: response.bookmarkedNoteCount,
    },
    recentNotes: response.recentNotes,
  };
}

export function useDashboardStats(options: DashboardOptions = {}) {
  const { includeRecent = true, recentSize = 5 } = options;
  const { user, isAuthenticated } = useNextAuth();
  
  // 쿼리 파라미터 생성
  const queryParams = new URLSearchParams({
    includeRecent: String(includeRecent),
    recentSize: String(Math.max(1, Math.min(10, recentSize))), // 1~10 사이로 제한
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
  const endpoint = `/api/v1/dashboard?${queryParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    isAuthenticated && user?.id ? endpoint : null,
    async () => {
      // 토큰 만료 확인 및 갱신
      const storedTokens = getStoredTokens();
      if (storedTokens && isTokenExpired()) {
        if (storedTokens.refreshToken) {
          const newTokens = await refreshAccessToken(storedTokens.refreshToken);
          if (newTokens) {
            storeTokens(newTokens);
          }
        }
      }

      // 현재 토큰으로 API 호출
      const currentToken = storedTokens?.accessToken;
      if (!currentToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const fetchWithToken = async (token: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        return response;
      };

      let response = await fetchWithToken(currentToken);

      // 401 에러인 경우 토큰 갱신 시도
      if (!response.ok && response.status === 401 && storedTokens?.refreshToken) {
        const newTokens = await refreshAccessToken(storedTokens.refreshToken);
        if (newTokens) {
          storeTokens(newTokens);
          response = await fetchWithToken(newTokens.accessToken);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '대시보드 데이터를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      const dashboardData: DashboardInfoResponse = result.data;
      
      // 데이터 변환
      return transformDashboardData(dashboardData);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      // 백그라운드에서 주기적으로 새로고침 (5분마다)
      refreshInterval: 300000,
      // 사용자가 페이지에 있을 때만 새로고침
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );
  
  return {
    stats: data,
    isLoading,
    error,
    mutateStats: mutate,
    isAuthenticated
  };
}
