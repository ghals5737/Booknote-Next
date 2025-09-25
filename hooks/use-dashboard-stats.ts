import { getStoredTokens, isTokenExpired, storeTokens } from '@/lib/api/token';
import useSWR from 'swr';
import { useNextAuth } from './use-next-auth';

export interface DashboardStats {
  books: {
    total: number;
    reading: number;
    finished: number;
    wishlist: number;
  };
  notes: {
    total: number;
    important: number;
    thisMonth: number;
  };
  quotes: {
    total: number;
    important: number;
  };
  recentActivity: Array<{
    type: 'NOTE_CREATED' | 'BOOK_ADDED' | 'QUOTE_ADDED' | 'BOOK_FINISHED';
    bookTitle: string;
    timestamp: string;
  }>;
}

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

export function useDashboardStats() {
  const { user, isAuthenticated } = useNextAuth();
  
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    isAuthenticated && user?.id ? '/api/v1/stats/dashboard' : null,
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

      const response = await fetch('/api/v1/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 401 에러인 경우 토큰 갱신 시도
        if (response.status === 401 && storedTokens?.refreshToken) {
          const newTokens = await refreshAccessToken(storedTokens.refreshToken);
          if (newTokens) {
            storeTokens(newTokens);
            // 갱신된 토큰으로 재시도
            const retryResponse = await fetch('/api/v1/stats/dashboard', {
              headers: {
                'Authorization': `Bearer ${newTokens.accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (retryResponse.ok) {
              const result = await retryResponse.json();
              return result.data;
            }
          }
        }
        throw new Error('통계 데이터를 불러오는데 실패했습니다.');
      }
      const result = await response.json();
      return result.data;
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
