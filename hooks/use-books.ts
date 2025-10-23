import { authenticatedApiRequest } from '@/lib/api/auth';
import { BookApiResponse, BookResponse, UserBookResponsePage } from '@/lib/types/book/book';
import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useNextAuth } from './use-next-auth';

// 캐시 무효화 헬퍼 함수
const invalidateBookCache = async () => {
  try {
    // 모든 책 목록 캐시 무효화 (다양한 페이지 크기 고려)
    await Promise.all([
      mutate(`/api/v1/user/books?page=0&size=10`),
      mutate(`/api/v1/user/books?page=0&size=20`),
      mutate(`/api/v1/user/books?page=0&size=50`),
    ]);
    console.log('[Cache] Book cache invalidated successfully');
  } catch (error) {
    console.error('[Cache] Error invalidating book cache:', error);
  }
};

// SWR fetcher 함수 (새로운 인증 API 사용)
const fetcher = async (url: string) => {
  try {
    console.log('[SWR Fetcher] Fetching from:', url);
    const response = await authenticatedApiRequest<UserBookResponsePage>(url);
    console.log("=================================================")
    console.log('[SWR Fetcher] Response:', response);
    console.log("=================================================")
    return response.data;
  } catch (error) {
    console.error('[SWR Fetcher] Error:', error);
    throw error;
  }
};

// SWR 기본 설정
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1분간 중복 요청 방지
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // 401, 403 에러는 재시도하지 않음 (인증 문제)
    return error?.status !== 401 && error?.status !== 403;
  },
};

// 책 목록 조회 훅
export function useBooks(page: number = 0, size: number = 10) {
  const { user, isLoading: authLoading, isAuthenticated } = useNextAuth();
  const userId = user?.id;

  // 디버깅 로그 추가
  console.log('=== useBooks 훅 디버깅 ===');
  console.log('[useBooks] user:', user);
  console.log('[useBooks] userId:', userId);
  console.log('[useBooks] isAuthenticated:', isAuthenticated);
  console.log('[useBooks] authLoading:', authLoading);

  // 인증 상태 확인
  const shouldFetch = isAuthenticated && !!userId;
  console.log('[useBooks] shouldFetch:', shouldFetch);
  
  // SWR 키 생성 (인증되지 않은 경우 null로 설정하여 요청 방지)
  const key = shouldFetch ? `/api/v1/user/books?page=${page}&size=${size}` : null;
  console.log('[useBooks] SWR key:', key);

  const { data, error, isLoading, mutate: mutateBooks } = useSWR<UserBookResponsePage>(
    key, // key가 null이면 자동으로 요청하지 않음
    fetcher,
    {
      ...defaultSWRConfig,
      // isPaused 제거 - key가 null일 때 자동으로 중단됨
    }
  );

  console.log('[useBooks] SWR result:', { data, error, isLoading });

  // 에러 처리 개선
  const handleError = (error: any) => {
    if (error?.status === 401) {
      console.warn('[useBooks] 인증이 필요합니다. 로그인을 확인해주세요.');
    } else if (error?.status === 403) {
      console.warn('[useBooks] 접근 권한이 없습니다.');
    }
    return error;
  };

  const result = {
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
    error: error ? handleError(error) : null,
    mutateBooks,
    // 인증 상태 추가
    isAuthenticated,
    userId,
  };

  console.log('[useBooks] Final result:', result);
  console.log('=== useBooks 훅 디버깅 끝 ===');
  
  return result;
}

// 통합된 책 추가 훅 (책 생성 + 사용자 서재에 추가)
export function useAddBook() {
  const { user, isAuthenticated } = useNextAuth();
  
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
    // 인증 상태 확인
    if (!isAuthenticated || !user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    console.log('[useAddBook] addBook called with user:', user);
    console.log('[useAddBook] bookData:', bookData);

    try {
      // 1단계: 책 생성 (새로운 인증 API 사용)
      console.log('[useAddBook] Step 1: Creating book...');
      const createResult = await authenticatedApiRequest<BookApiResponse['data']>('/api/v1/user-books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      });
      console.log('[useAddBook] Book created:', createResult);
      
      const bookId = createResult.data.id;

      if (!bookId) {
        throw new Error('생성된 책의 ID를 가져올 수 없습니다.');
      }

      // 2단계: 사용자 서재에 추가 (새로운 인증 API 사용)
      console.log('[useAddBook] Step 2: Linking user to book...', { userId: user.id, bookId });
      await authenticatedApiRequest('/api/v1/user-books', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          bookId: bookId
        })
      });
      console.log('[useAddBook] User-book link created successfully');

      // 책 목록 캐시 무효화하여 새로고침
      console.log('[useAddBook] Step 3: Invalidating cache...');
      await invalidateBookCache();
      
      return createResult.data;
    } catch (error) {
      console.error('[useAddBook] Error adding book:', error);
      throw error;
    }
  };

  return { 
    addBook,
    isAuthenticated,
    userId: user?.id,
  };
}

// 사용자별 책 추가 훅 (기존 API 유지)
export function useAddUserBook() {
  const { user, isAuthenticated } = useNextAuth();
  
  // 사용자와 기존 책(bookId)을 연결하는 API 호출
  const addUserBook = async (payload: { userId: number; bookId: number }) => {
    // 인증 상태 확인
    if (!isAuthenticated || !user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const result = await authenticatedApiRequest('/api/v1/user-books', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      // 책 목록 캐시 무효화하여 새로고침
      await invalidateBookCache();
      return result.data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  return { 
    addUserBook,
    isAuthenticated,
    userId: user?.id,
  };
}

// 책 삭제 훅
export function useDeleteBook() {
  const { user, isAuthenticated } = useNextAuth();
  
  const deleteBook = async (bookId: number) => {
    // 인증 상태 확인
    if (!isAuthenticated || !user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await authenticatedApiRequest(`/api/v1/user/books/${bookId}`, {
        method: 'DELETE'
      });
      // 책 목록 캐시 무효화하여 새로고침
      await invalidateBookCache();
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  return { 
    deleteBook,
    isAuthenticated,
    userId: user?.id,
  };
}

// 책 업데이트 훅
export function useUpdateBook() {
  const { user, isAuthenticated } = useNextAuth();
  
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
    // 인증 상태 확인
    if (!isAuthenticated || !user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const result = await authenticatedApiRequest(`/api/v1/user/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      });
      
      // 책 목록 캐시 무효화하여 새로고침
      await invalidateBookCache();
      
      return result.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  return { 
    updateBook,
    isAuthenticated,
    userId: user?.id,
  };
}

// 책 검색 훅 (외부 API 사용)
export function useSearchBooks() {
  const { isAuthenticated } = useNextAuth();
  
  const searchBooks = async (query: string) => {
    // 인증 상태 확인
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!query.trim()) {
      throw new Error('검색어를 입력해주세요.');
    }

    try {
      // 새로운 인증 API 사용
      const result = await authenticatedApiRequest(`/api/v1/search/books?query=${encodeURIComponent(query)}`);
      console.log('[useSearchBooks] 백엔드 응답:', result);
      
      // 백엔드 ApiResponse 형식에 맞게 파싱
      const books = result?.data || [];
      console.log('[useSearchBooks] 파싱된 책 목록:', books);

      // 결과를 다이얼로그에서 기대하는 형태로 정규화
      const normalized = (books as BookResponse[]).map((item) => ({
        title: item.title ?? '',
        author: item.author ?? '',
        publisher: item.publisher ?? '',
        isbn: item.isbn ?? '',
        description: item.description ?? '',
        imgUrl: item.imgUrl ?? '',
      }));

      return normalized;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  };

  return { 
    searchBooks,
    isAuthenticated,
  };
} 