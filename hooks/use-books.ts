import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client';
import { BookApiResponse, UserBookResponsePage } from '@/lib/types/book/book';
import useSWR, { mutate } from 'swr';
import { useNextAuth } from './use-next-auth';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// SWR fetcher 함수 (API 클라이언트 사용)
const fetcher = async (url: string) => {
  try {
    console.log('Fetching books from:', url);
    const response = await apiGet<UserBookResponsePage>(url);
    console.log('Books response:', response);
    return response.data;
  } catch (error) {
    console.error('Books fetch error:', error);
    throw error;
  }
};

// 책 목록 조회 훅
export function useBooks(page: number = 0, size: number = 10) {
  const { user, isLoading: authLoading, isAuthenticated } = useNextAuth();
  const userId = user?.id;

  const shouldFetch = isAuthenticated && !!userId;
  // API 클라이언트가 자동으로 BASE_URL을 추가하므로 상대 경로만 사용
  const key = shouldFetch ? `/api/v1/user/books?page=${page}&size=${size}` : null;

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

// 통합된 책 추가 훅 (책 생성 + 사용자 서재에 추가)
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
    console.log('[useAddBook] addBook called with user:', user);
    console.log('[useAddBook] bookData:', bookData);
    
    if (!user?.id) {
      console.error('[useAddBook] No user ID found:', user);
      throw new Error('사용자 정보가 없습니다.');
    }

    try {
      // 1단계: 책 생성 (API 클라이언트 사용)
      console.log('[useAddBook] Step 1: Creating book...');
      const createResult = await apiPost<BookApiResponse['data']>('/api/v1/user-books', bookData);
      console.log('[useAddBook] Book created:', createResult);
      
      const bookId = createResult.data.id;

      if (!bookId) {
        throw new Error('생성된 책의 ID를 가져올 수 없습니다.');
      }

      // 2단계: 사용자 서재에 추가 (API 클라이언트 사용)
      console.log('[useAddBook] Step 2: Linking user to book...', { userId: user.id, bookId });
      await apiPost('/api/v1/user-books', {
        userId: user.id,
        bookId: bookId
      });
      console.log('[useAddBook] User-book link created successfully');

      // 책 목록 캐시 무효화하여 새로고침
      console.log('[useAddBook] Step 3: Invalidating cache...');
      await mutate(`/api/v1/user/books?page=0&size=10`);
      
      return createResult.data;
    } catch (error) {
      console.error('[useAddBook] Error adding book:', error);
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
      const result = await apiPost('/api/v1/user-books', payload);
      // 책 목록 캐시 무효화하여 새로고침
      await mutate(`/api/v1/user/books?page=0&size=10`);
      return result.data;
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
      await apiDelete(`/api/v1/users/${user?.id}/books/${bookId}`);
      // 책 목록 캐시 무효화하여 새로고침
      await mutate(`/api/v1/user/books?page=0&size=10`);
      
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
      const result = await apiPut(`/api/v1/users/${user?.id}/books/${bookId}`, bookData);
      
      // 책 목록 캐시 무효화하여 새로고침
      await mutate(`/api/v1/user/books?page=0&size=10`);
      
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
  const searchBooks = async (query: string) => {
    try {
      // API 클라이언트 사용
      const result = await apiGet(`/api/v1/search/books?query=${encodeURIComponent(query)}`);
      console.log('[useSearchBooks] 백엔드 응답:', result);
      
      // 백엔드 ApiResponse 형식에 맞게 파싱
      const books = result?.data || [];
      console.log('[useSearchBooks] 파싱된 책 목록:', books);

      // 결과를 다이얼로그에서 기대하는 형태로 정규화
      const normalized = (books as any[]).map((item) => ({
        title: item.title ?? '',
        author: item.author ?? '',
        publisher: item.publisher ?? '',
        isbn: item.isbn ?? '',
        description: item.description ?? '',
        cover: item.image ?? item.cover ?? '',
      }));

      return normalized;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  };

  return { searchBooks };
} 