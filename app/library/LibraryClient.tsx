"use client"

import { AddBookDialog } from "@/components/book/AddBookDialog"
import { Book, useBook } from "@/components/context/BookContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, BookOpen, Building, Clock, Loader2, Plus, RefreshCw, User } from "lucide-react"
import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface LibraryClientProps {
  initialBooks: Book[]
}

export function LibraryClient({ initialBooks }: LibraryClientProps) {
  const { books, isLoading, error, mutateBooks, setCurrentView, setSelectedBook } = useBook()
  
  // initialBooks가 있으면 SWR 캐시에 설정
  useEffect(() => {
    if (initialBooks && initialBooks.length > 0) {
      mutateBooks(initialBooks, false)
    }
  }, [initialBooks, mutateBooks])
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()

  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
    setCurrentView("book")
    router.push(`/book`)
  }

  const handleRetry = () => {
    mutateBooks()
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
            <p className="text-cool mt-1">책 목록을 불러오는데 실패했습니다</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">데이터를 불러올 수 없습니다</h3>
          <p className="text-cool mb-6">네트워크 연결을 확인하고 다시 시도해주세요.</p>
          <Button
            onClick={handleRetry}
            variant="outline"
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
          <p className="text-cool mt-1">총 {books.length}권의 책이 있습니다</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="button-primary rounded-xl animate-slide-up animation-delay-200"
        >
          <Plus className="h-4 w-4" />책 추가
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-cool" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">아직 등록된 책이 없습니다</h3>
          <p className="text-cool mb-6">첫 번째 책을 추가해보세요!</p>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="button-primary rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            첫 번째 책 추가하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <Card
              key={book.id}
              className="cursor-pointer card-hover border-secondary bg-card rounded-xl animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleBookClick(book)}
            >
              <CardHeader className="pb-3">
                <div className="aspect-[3/4] w-full mb-3 rounded-lg overflow-hidden bg-muted shadow-soft">
                  <Image 
                  src={book.cover || "/placeholder.svg"} 
                  alt={book.title} 
                  width={300}
                  height={400}
                  className="w-full h-full object-cover" />
                </div>
                <CardTitle className="text-lg text-foreground line-clamp-2">{book.title}</CardTitle>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-cool">
                    <User className="h-3 w-3" />
                    <span className="truncate">{book.author}</span>
                  </div>
                  {book.publisher && (
                    <div className="flex items-center gap-1 text-xs text-cool/70">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{book.publisher}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Badge variant="secondary" className="bg-ice text-primary border border-primary/20 rounded-lg">
                    {book.category}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cool">읽기 진행률</span>
                      <span className="text-foreground font-medium">{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2 rounded-full" />

                    {book.totalPages > 0 && (
                      <div className="flex items-center justify-between text-xs text-cool/70">
                        <span>페이지</span>
                        <span>
                          {book.currentPage} / {book.totalPages}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-cool">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{book.notes.length}개 노트</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{moment(book.createdAt).format("YYYY-MM-DD")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBookDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
} 