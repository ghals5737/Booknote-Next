"use client"

import { useState } from "react"
import { Plus, BookOpen, Clock, User, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Book, useBook } from "@/components/context/BookContext"
import { AddBookDialog } from "@/components/book/AddBookDialog"
import moment from "moment"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LibraryView() {
  const { books, setCurrentView, setSelectedBook } = useBook()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()

  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
    setCurrentView("book")
    router.push(`/book`)
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

      <AddBookDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
