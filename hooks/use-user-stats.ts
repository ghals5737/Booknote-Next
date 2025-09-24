import { apiGet } from '@/lib/api/client';
import useSWR from 'swr';
import { useNextAuth } from './use-next-auth';

export interface UserStats {
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
    type: 'note_created' | 'book_added' | 'quote_added' | 'book_finished';
    bookTitle: string;
    timestamp: string;
  }>;
}

export function useUserStats() {
  const { user, isAuthenticated } = useNextAuth();
  
  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    isAuthenticated && user?.id ? '/api/v1/stats/dashboard' : null,
    async () => {
      const response = await apiGet<UserStats>('/api/v1/stats/dashboard');
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
      errorRetryCount: 3,
      errorRetryInterval: 5000,
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
