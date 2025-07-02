"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isImportant: boolean
}

export interface Quote {
  id: string
  text: string
  page?: number
  chapter?: string
  thoughts?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isImportant: boolean
}

export interface Book {
  id: string
  title: string
  author: string
  cover: string
  category: string
  notes: Note[]
  quotes: Quote[]
  createdAt: Date
  startDate?: Date
  endDate?: Date
  progress: number
  currentPage: number
  totalPages: number
  isbn?: string
  publisher?: string
  description?: string
}

export interface BookSearchResult {
  title: string
  image: string
  isbn: string
  publisher: string
  description: string
  author: string
}

interface BookContextType {
  books: Book[]
  currentView: "library" | "book-detail" | "note-editor" | "search" | "remind" | "stats" | "book" | "note"
  selectedBook: Book | null
  selectedNote: Note | null
  searchQuery: string
  setCurrentView: (view: BookContextType["currentView"]) => void
  setSelectedBook: (book: Book | null) => void
  setSelectedNote: (note: Note | null) => void
  setSearchQuery: (query: string) => void
  addBook: (book: Omit<Book, "id" | "createdAt">) => void
  updateBook: (bookId: string, updates: Partial<Book>) => void
  addNote: (bookId: string, note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void
  updateNote: (bookId: string, noteId: string, updates: Partial<Note>) => void
  deleteNote: (bookId: string, noteId: string) => void
  addQuote: (bookId: string, quote: Omit<Quote, "id" | "createdAt" | "updatedAt">) => void
  updateQuote: (bookId: string, quoteId: string, updates: Partial<Quote>) => void
  deleteQuote: (bookId: string, quoteId: string) => void
  searchBooks: (query: string) => Promise<BookSearchResult[]>
}

const BookContext = createContext<BookContextType | undefined>(undefined)

const sampleBooks: Book[] = [
  {
    id: "1",
    title: "아토믹 해빗",
    author: "제임스 클리어",
    cover: "/placeholder.svg?height=200&width=150",
    category: "자기계발",
    progress: 75,
    currentPage: 225,
    totalPages: 300,
    createdAt: new Date("2024-01-15"),
    startDate: new Date("2024-01-15"),
    endDate: undefined,
    isbn: "9788934985907",
    publisher: "비즈니스북스",
    description: "작은 변화가 만드는 놀라운 결과에 대한 책",
    notes: [
      {
        id: "1",
        title: "1% 법칙의 힘",
        content: "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
        tags: ["핵심개념", "수학"],
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-16"),
        isImportant: true,
      },
      {
        id: "2",
        title: "습관 스택킹",
        content: '기존 습관에 새로운 습관을 연결하는 방법. "커피를 마신 후에 명상을 5분 한다"',
        tags: ["실천방법", "습관"],
        createdAt: new Date("2024-01-18"),
        updatedAt: new Date("2024-01-18"),
        isImportant: false,
      },
    ],
    quotes: [
      {
        id: "1",
        text: "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
        page: 45,
        chapter: "1장",
        thoughts: "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
        tags: ["핵심", "동기부여"],
        createdAt: new Date("2024-01-17"),
        updatedAt: new Date("2024-01-17"),
        isImportant: true,
      },
      {
        id: "2",
        text: "변화의 가장 효과적인 방법은 무엇을 하려고 하는지가 아니라 누가 되려고 하는지에 집중하는 것이다.",
        page: 78,
        thoughts: "정체성 기반 습관의 중요성을 알게 되었다.",
        tags: ["정체성", "변화"],
        createdAt: new Date("2024-01-19"),
        updatedAt: new Date("2024-01-19"),
        isImportant: false,
      },
    ],
  },
  {
    id: "2",
    title: "클린 코드",
    author: "로버트 C. 마틴",
    cover: "/placeholder.svg?height=200&width=150",
    category: "개발",
    progress: 100,
    currentPage: 400,
    totalPages: 400,
    createdAt: new Date("2024-02-01"),
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-28"),
    isbn: "9788966260959",
    publisher: "인사이트",
    description: "애자일 소프트웨어 장인 정신",
    notes: [
      {
        id: "3",
        title: "의미있는 이름 짓기",
        content: "변수명, 함수명은 그 의도를 명확히 드러내야 한다. 주석이 필요없을 정도로.",
        tags: ["네이밍", "기본원칙"],
        createdAt: new Date("2024-02-02"),
        updatedAt: new Date("2024-02-02"),
        isImportant: true,
      },
    ],
    quotes: [
      {
        id: "3",
        text: "깨끗한 코드는 한 가지를 제대로 한다.",
        page: 15,
        chapter: "1장",
        thoughts: "단순하지만 강력한 원칙이다. 하나의 함수는 하나의 일만 해야 한다.",
        tags: ["원칙", "설계"],
        createdAt: new Date("2024-02-03"),
        updatedAt: new Date("2024-02-03"),
        isImportant: true,
      },
    ],
  },
  {
    id: "3",
    title: "사피엔스",
    author: "유발 하라리",
    cover: "/placeholder.svg?height=200&width=150",
    category: "역사",
    progress: 20,
    currentPage: 80,
    totalPages: 400,
    createdAt: new Date("2024-02-10"),
    startDate: new Date("2024-02-10"),
    isbn: "9788934972464",
    publisher: "김영사",
    description: "유인원에서 사이보그까지, 인간 역사의 대담하고 위대한 질문",
    notes: [],
    quotes: [],
  },
]

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(sampleBooks)
  const [currentView, setCurrentView] = useState<BookContextType["currentView"]>("library")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const addBook = (bookData: Omit<Book, "id" | "createdAt">) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      createdAt: new Date(),
      quotes: [],
    }
    setBooks((prev) => [...prev, newBook])
  }

  const updateBook = (bookId: string, updates: Partial<Book>) => {
    setBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, ...updates } : book)))
  }

  const addNote = (bookId: string, noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, notes: [...book.notes, newNote] } : book)))
  }

  const updateNote = (bookId: string, noteId: string, updates: Partial<Note>) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? {
              ...book,
              notes: book.notes.map((note) =>
                note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note,
              ),
            }
          : book,
      ),
    )
  }

  const deleteNote = (bookId: string, noteId: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, notes: book.notes.filter((note) => note.id !== noteId) } : book,
      ),
    )
  }

  const addQuote = (bookId: string, quoteData: Omit<Quote, "id" | "createdAt" | "updatedAt">) => {
    const newQuote: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, quotes: [...book.quotes, newQuote] } : book)),
    )
  }

  const updateQuote = (bookId: string, quoteId: string, updates: Partial<Quote>) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? {
              ...book,
              quotes: book.quotes.map((quote) =>
                quote.id === quoteId ? { ...quote, ...updates, updatedAt: new Date() } : quote,
              ),
            }
          : book,
      ),
    )
  }

  const deleteQuote = (bookId: string, quoteId: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId ? { ...book, quotes: book.quotes.filter((quote) => quote.id !== quoteId) } : book,
      ),
    )
  }

  // Mock API call for book search
  const searchBooks = async (query: string): Promise<BookSearchResult[]> => {
    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - 실제로는 API에서 받아올 데이터
    const mockResults: BookSearchResult[] = [
      {
        title: "아토믹 해빗",
        image: "/placeholder.svg?height=200&width=150",
        isbn: "9788934985907",
        publisher: "비즈니스북스",
        description: "작은 변화가 만드는 놀라운 결과",
        author: "제임스 클리어",
      },
      {
        title: "클린 코드",
        image: "/placeholder.svg?height=200&width=150",
        isbn: "9788966260959",
        publisher: "인사이트",
        description: "애자일 소프트웨어 장인 정신",
        author: "로버트 C. 마틴",
      },
      {
        title: "사피엔스",
        image: "/placeholder.svg?height=200&width=150",
        isbn: "9788934972464",
        publisher: "김영사",
        description: "유인원에서 사이보그까지, 인간 역사의 대담하고 위대한 질문",
        author: "유발 하라리",
      },
    ].filter((book) => book.title.toLowerCase().includes(query.toLowerCase()))

    return mockResults
  }

  return (
    <BookContext.Provider
      value={{
        books,
        currentView,
        selectedBook,
        selectedNote,
        searchQuery,
        setCurrentView,
        setSelectedBook,
        setSelectedNote,
        setSearchQuery,
        addBook,
        updateBook,
        addNote,
        updateNote,
        deleteNote,
        addQuote,
        updateQuote,
        deleteQuote,
        searchBooks,
      }}
    >
      {children}
    </BookContext.Provider>
  )
}

export function useBook() {
  const context = useContext(BookContext)
  if (context === undefined) {
    throw new Error("useBook must be used within a BookProvider")
  }
  return context
}
