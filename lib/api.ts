import { Book } from '@/components/context/BookContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9377'

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  data: T
}

export interface UserBookResponse {
  bookId: number
  title: string
  author: string
  readAt?: string
}

export interface NoteResponse {
  id: number
  bookId: number
  title: string
  content: string
  html: string
  isImportant: boolean
  tagName?: string
  tagList: string[]
}

export interface StatisticsDashboardResponse {
  monthlyStats: Array<{
    month: string
    readBookCount: number
    noteCount: number
  }>
  categoryStats: Array<{
    category: string
    totalBooks: number
    readBooks: number
  }>
  averageProgress: number
  importantNoteCount: number
}

// 서버사이드용 fetch 함수 (절대 경로 사용)
export const serverFetch = async (url: string, options?: RequestInit) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// 클라이언트사이드용 fetch 함수 (상대 경로 사용)
export const clientFetch = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// 책 목록 조회 (서버사이드)
export const fetchBooksServer = async (): Promise<Book[]> => {
  try {
    const response: ApiResponse<UserBookResponse[]> = await serverFetch('/api/v1/users/1/books')
    
    if (!response.success) {
      throw new Error(response.message)
    }

    // UserBookResponse를 Book 인터페이스에 맞게 변환
    return response.data.map((book) => ({
      id: String(book.bookId),
      title: book.title,
      author: book.author,
      cover: "/placeholder.svg", // API에서 제공하지 않으므로 기본값
      category: "기타",
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      createdAt: book.readAt ? new Date(book.readAt) : new Date(),
      startDate: undefined,
      endDate: undefined,
      isbn: undefined,
      publisher: undefined,
      description: undefined,
      notes: [],
      quotes: [],
    }))
  } catch (error) {
    console.error('Error fetching books from server:', error)
    return []
  }
}

// 책 목록 조회 (클라이언트사이드)
export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response: ApiResponse<UserBookResponse[]> = await clientFetch('/api/v1/users/1/books')
    
    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data.map((book) => ({
      id: String(book.bookId),
      title: book.title,
      author: book.author,
      cover: "/placeholder.svg",
      category: "기타",
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      createdAt: book.readAt ? new Date(book.readAt) : new Date(),
      startDate: undefined,
      endDate: undefined,
      isbn: undefined,
      publisher: undefined,
      description: undefined,
      notes: [],
      quotes: [],
    }))
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

// 노트 목록 조회
export const fetchNotes = async (userId: number = 1, bookId?: number): Promise<NoteResponse[]> => {
  try {
    const url = bookId 
      ? `/api/v1/notes/users/${userId}?bookId=${bookId}`
      : `/api/v1/notes/users/${userId}`
    
    const response: ApiResponse<NoteResponse[]> = await clientFetch(url)
    
    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.error('Error fetching notes:', error)
    throw error
  }
}

// 노트 생성
export const createNote = async (noteData: {
  bookId: number
  userId: number
  title: string
  content: string
  html: string
  isImportant: boolean
}): Promise<NoteResponse> => {
  try {
    const response: ApiResponse<NoteResponse> = await clientFetch('/api/v1/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    })
    
    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

// 노트 삭제
export const deleteNote = async (noteId: number): Promise<void> => {
  try {
    const response: ApiResponse<string> = await clientFetch('/api/v1/notes', {
      method: 'DELETE',
      body: JSON.stringify({ id: noteId }),
    })
    
    if (!response.success) {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}

// 통계 대시보드 데이터 조회
export const fetchDashboardStats = async (): Promise<StatisticsDashboardResponse> => {
  try {
    const response: StatisticsDashboardResponse = await clientFetch('/api/v1/statistics/dashboard')
    return response
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// 책 검색
export const searchBooks = async (query: string): Promise<Array<{
  title: string
  link?: string
  image?: string
  author: string
  discount?: string
  publisher: string
  pubdate?: string
  isbn: string
  description: string
}>> => {
  try {
    const response = await clientFetch(`/api/v1/search/books?query=${encodeURIComponent(query)}`)
    return response
  } catch (error) {
    console.error('Error searching books:', error)
    throw error
  }
}

// 책 추가
export const createBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<Book> => {
  try {
    const response: ApiResponse<{
      id: number
      title: string
      author: string
      imgUrl?: string
      category?: string
      progress?: number
      totalPages?: number
      isbn?: string
      publisher?: string
      description?: string
    }> = await clientFetch('/api/v1/books', {
      method: 'POST',
      body: JSON.stringify({
        title: bookData.title,
        description: bookData.description || '',
        author: bookData.author,
        category: bookData.category || '기타',
        progress: bookData.progress || 0,
        totalPages: bookData.totalPages || 0,
        imgUrl: bookData.cover || '/placeholder.svg',
        isbn: bookData.isbn || '',
        publisher: bookData.publisher || '',
        pubdate: new Date().toISOString().split('T')[0],
      }),
    })
    
    if (!response.success) {
      throw new Error(response.message)
    }

    return {
      id: String(response.data.id),
      title: response.data.title,
      author: response.data.author,
      cover: response.data.imgUrl || '/placeholder.svg',
      category: response.data.category || '기타',
      progress: response.data.progress || 0,
      currentPage: 0,
      totalPages: response.data.totalPages || 0,
      createdAt: new Date(),
      startDate: undefined,
      endDate: undefined,
      isbn: response.data.isbn,
      publisher: response.data.publisher,
      description: response.data.description,
      notes: [],
      quotes: [],
    }
  } catch (error) {
    console.error('Error creating book:', error)
    throw error
  }
}

// 책 수정
export const updateBook = async (bookId: string, updates: Partial<Book>): Promise<Book> => {
  try {
    const response: ApiResponse<{
      id: number
      title: string
      author: string
      imgUrl?: string
      category?: string
      progress?: number
      totalPages?: number
      isbn?: string
      publisher?: string
      description?: string
    }> = await clientFetch('/api/v1/books', {
      method: 'PUT',
      body: JSON.stringify({
        id: parseInt(bookId),
        title: updates.title,
        description: updates.description || '',
        author: updates.author,
        category: updates.category || '기타',
        progress: updates.progress || 0,
        totalPages: updates.totalPages || 0,
        imgUrl: updates.cover || '/placeholder.svg',
        isbn: updates.isbn || '',
        pubdate: new Date().toISOString().split('T')[0],
      }),
    })
    
    if (!response.success) {
      throw new Error(response.message)
    }

    return {
      id: String(response.data.id),
      title: response.data.title,
      author: response.data.author,
      cover: response.data.imgUrl || '/placeholder.svg',
      category: response.data.category || '기타',
      progress: response.data.progress || 0,
      currentPage: 0,
      totalPages: response.data.totalPages || 0,
      createdAt: new Date(),
      startDate: undefined,
      endDate: undefined,
      isbn: response.data.isbn,
      publisher: response.data.publisher,
      description: response.data.description,
      notes: [],
      quotes: [],
    }
  } catch (error) {
    console.error('Error updating book:', error)
    throw error
  }
}

// 책 삭제
export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    const response: ApiResponse<string> = await clientFetch(`/api/v1/books/${bookId}`, {
      method: 'DELETE',
    })
    
    if (!response.success) {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('Error deleting book:', error)
    throw error
  }
} 