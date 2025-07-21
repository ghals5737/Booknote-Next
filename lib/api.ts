import { Book } from '@/components/context/BookContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiResponse<T> {
  data: T
  error?: string
}

// 책 목록 조회
export const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/books`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // credentials: 'include', // 쿠키 포함 시 필요
  })

  if (!response.ok) {
    throw new Error('Failed to fetch books')
  }

  const data = await response.json()
  
  // API 응답 데이터를 Book 인터페이스에 맞게 변환
  return data.map((book: Record<string, unknown>) => ({
    id: String(book.id),
    title: String(book.title),
    author: String(book.author),
    cover: book.cover ? String(book.cover) : "/placeholder.svg",
    category: book.category ? String(book.category) : "기타",
    progress: typeof book.progress === 'number' ? book.progress : 0,
    currentPage: typeof book.currentPage === 'number' ? book.currentPage : 0,
    totalPages: typeof book.totalPages === 'number' ? book.totalPages : 0,
    createdAt: new Date(String(book.createdAt)),
    startDate: book.startDate ? new Date(String(book.startDate)) : undefined,
    endDate: book.endDate ? new Date(String(book.endDate)) : undefined,
    isbn: book.isbn ? String(book.isbn) : undefined,
    publisher: book.publisher ? String(book.publisher) : undefined,
    description: book.description ? String(book.description) : undefined,
    notes: Array.isArray(book.notes) ? book.notes : [],
    quotes: Array.isArray(book.quotes) ? book.quotes : [],
  }))
}

// 책 추가
export const createBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData),
  })

  if (!response.ok) {
    throw new Error('Failed to create book')
  }

  return response.json()
}

// 책 수정
export const updateBook = async (bookId: string, updates: Partial<Book>): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/books/${bookId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update book')
  }

  return response.json()
}

// 책 삭제
export const deleteBook = async (bookId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/books/${bookId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete book')
  }
} 