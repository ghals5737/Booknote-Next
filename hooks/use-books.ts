import { BookApiResponse, UserBookResponsePage } from '@/lib/types/book/book';
import useSWR, { mutate } from 'swr';
import { useNextAuth } from './use-next-auth';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// SWR fetcher 함수 (타임아웃 포함)
const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
  const response = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  return data?.data ?? data;
};

// 책 목록 조회 훅
export function useBooks(page: number = 0, size: number = 10) {
  const { user, isLoading: authLoading, isAuthenticated } = useNextAuth();
  const userId = user?.id;

  const shouldFetch = isAuthenticated && !!userId;
  const key = shouldFetch ? `/api/v1/users/${userId}/books?page=${page}&size=${size}` : null;

  const { data, error, isLoading, mutate: mutateBooks } = useSWR<UserBookResponsePage>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
    }
  );

  return {
    books: data?.content || [],
    pagination: data ? {
      pageNumber: data.pageable.pageNumber,
      pageSize: data.pageable.pageSize,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      last: data.last,
      first: data.first,
    } : null,
    isLoading: authLoading || isLoading,
    error,
    mutateBooks,
  };
}

// 백엔드 책 추가 훅 (BookController API 사용)
export function useAddBook() {
  const { user } = useNextAuth();
  const addBook = async (bookData: {
    title: string;
    author: string;
    description: string;
    category: string;
    progress: number;
    totalPages: number;
    imgUrl: string;
    isbn: string;
    publisher: string;
    pubdate: string;
  }) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error('Failed to add book');
      }

      const result: BookApiResponse = await response.json();
      
      // 책 목록 캐시 무효화하여 새로고침 (세션 사용자 기준)
      if (user?.id) {
        await mutate(`/api/v1/users/${user.id}/books?page=0&size=10`);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  return { addBook };
}

// 사용자별 책 추가 훅 (기존 API 유지)
export function useAddUserBook() {
  // 사용자와 기존 책(bookId)을 연결하는 API 호출
  const addUserBook = async (payload: { userId: number; bookId: number }) => {
    try {
      const response = await fetch(`/api/v1/user-books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add book');
      }

      const result = await response.json();
      // 책 목록 캐시 무효화하여 새로고침 (userId는 payload.userId 사용)
      await mutate(`${NEXT_PUBLIC_API_URL}/api/v1/users/${payload.userId}/books?page=0&size=10`);
      return result.data || result;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  return { addUserBook };
}

// 책 삭제 훅
export function useDeleteBook() {
  const { user } = useNextAuth();
  const deleteBook = async (bookId: number) => {
    try {
      const response = await fetch(`/api/v1/users/${user?.id}/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      // 책 목록 캐시 무효화하여 새로고침
      if (user?.id) {
        await mutate(`/api/v1/users/${user.id}/books?page=0&size=10`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  return { deleteBook };
}

// 책 업데이트 훅
export function useUpdateBook() {
  const { user } = useNextAuth();
  const updateBook = async (bookId: number, bookData: {
    title?: string;
    author?: string;
    description?: string;
    category?: string;
    totalPages?: number;
    currentPage?: number;
    progress?: number;
    rating?: number;
    coverImage?: string;
    publisher?: string;
    isbn?: string;
  }) => {
    try {
      const response = await fetch(`/api/v1/users/${user?.id}/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error('Failed to update book');
      }

      const result = await response.json();
      
      // 책 목록 캐시 무효화하여 새로고침
      if (user?.id) {
        await mutate(`/api/v1/users/${user.id}/books?page=0&size=10`);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  return { updateBook };
}

// 책 검색 훅 (외부 API 사용)
export function useSearchBooks() {
  const searchBooks = async (query: string, limit: number = 10) => {
    try {
      // 내부 프록시 경유 (신규 엔드포인트 형태: /api/v1/search/books?query=)
      const response = await fetch(`/api/v1/search/books?query=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      const result = await response.json();
      // 응답이 배열인 경우(예: 네이버 쇼핑 책 검색 형태)도 지원
      const rawItems = Array.isArray(result)
        ? result
        : (result?.data?.books || result?.books || []);

      // 결과를 다이얼로그에서 기대하는 형태로 정규화
      const normalized = (rawItems as any[]).map((item) => ({
        title: item.title ?? '',
        author: item.author ?? '',
        publisher: item.publisher ?? '',
        isbn: item.isbn ?? '',
        description: item.description ?? '',
        cover: item.cover ?? item.image ?? '',
      }));

      return normalized;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  };

  return { searchBooks };
} 