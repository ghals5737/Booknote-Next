import useSWR, { mutate } from 'swr';
import { UserBookResponsePage } from '@/lib/types/book/book';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

// SWR fetcher 함수
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  return data.data;
};

// 책 목록 조회 훅
export function useBooks(page: number = 0, size: number = 10) {
  const { data, error, isLoading, mutate: mutateBooks } = useSWR<UserBookResponsePage>(
    `${NEXT_PUBLIC_API_URL}/api/v1/users/1/books?page=${page}&size=${size}`,
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
    isLoading,
    error,
    mutateBooks,
  };
}

// 책 추가 훅
export function useAddBook() {
  const addBook = async (bookData: {
    title: string;
    author: string;
    description: string;
    category: string;
    totalPages: number;
    coverImage?: string;
    publisher?: string;
    isbn?: string;
  }) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error('Failed to add book');
      }

      const result = await response.json();
      
      // 책 목록 캐시 무효화하여 새로고침
      await mutate(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books?page=0&size=10`);
      
      return result.data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  return { addBook };
}

// 책 삭제 훅
export function useDeleteBook() {
  const deleteBook = async (bookId: number) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      // 책 목록 캐시 무효화하여 새로고침
      await mutate(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books?page=0&size=10`);
      
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
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books/${bookId}`, {
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
      await mutate(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books?page=0&size=10`);
      
      return result.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  return { updateBook };
} 