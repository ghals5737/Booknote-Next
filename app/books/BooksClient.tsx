'use client'

import { AddBookDialog } from "@/components/book/AddBookDialog"
import { useBook } from "@/components/context/BookContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, BookOpen, Building, Clock, Loader2, Plus, RefreshCw } from "lucide-react"
import moment from "moment"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface BooksClientProps {
  initialBooks: Array<{
    id: string
    title: string
    author: string
    cover: string
    category: string
    progress: number
    currentPage: number
    totalPages: number
    createdAt: Date
    startDate?: Date
    endDate?: Date
    isbn?: string
    publisher?: string
    description?: string
    notes: any[]
    quotes: any[]
  }>
}

export function BooksClient({ initialBooks }: BooksClientProps) {
  const { books, isLoading, error, mutateBooks, setCurrentView, setSelectedBook } = useBook()

  // initialBooks가 있으면 SWR 캐시에 설정
  useEffect(() => {
    if (initialBooks && initialBooks.length > 0) {
      mutateBooks(initialBooks, false)
    }
  }, [initialBooks, mutateBooks])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()

  const handleBookClick = (book: any) => {
    setSelectedBook(book)
    setCurrentView("book-detail")
    router.push(`/book`)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
            <p className="text-cool mt-1">책 목록을 불러오는 중...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-cool">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>책 목록을 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
            <p className="text-cool mt-1">오류가 발생했습니다</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-cool">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <span>책 목록을 불러오는 중 오류가 발생했습니다</span>
            <Button 
              onClick={() => mutateBooks()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
          <p className="text-cool mt-1">총 {books.length}권의 책</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-primary hover:opacity-90 animate-slide-up"
        >
          <Plus className="h-4 w-4 mr-2" />
          책 추가
        </Button>
      </div>

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, index) => (
            <Card 
              key={book.id} 
              className="border-secondary bg-card hover:shadow-md transition-shadow cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleBookClick(book)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {book.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>{book.notes.length}개 노트</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Book Cover */}
                <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>진행률</span>
                      <span>{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2" />
                    {book.totalPages > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.currentPage} / {book.totalPages} 페이지
                      </p>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{moment(book.createdAt).format('YYYY-MM-DD')}</span>
                    </div>
                    {book.publisher && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{book.publisher}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">아직 추가된 책이 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            첫 번째 책을 추가하고 독서 여정을 시작해보세요.
          </p>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            첫 번째 책 추가하기
          </Button>
        </div>
      )}

      {/* Add Book Dialog */}
      <AddBookDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onBookAdded={(newBook) => {
          mutateBooks()
          setShowAddDialog(false)
        }}
      />
    </div>
  )
} 