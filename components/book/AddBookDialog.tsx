"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAddBook, useAddUserBook, useSearchBooks } from "@/hooks/use-books"
import { ArrowLeft, BookOpen, Calendar, Loader2, Plus, Search } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BookSearchResult {
  title: string
  author: string
  publisher: string
  isbn: string
  description: string
  cover: string
}

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [publisher, setPublisher] = useState("")
  const [isbn, setIsbn] = useState("")
  const [description, setDescription] = useState("")
  const [cover, setCover] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [pubdate, setPubdate] = useState("")

  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mode, setMode] = useState<"search" | "manual">("search")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addBook } = useAddBook()
  const { addUserBook } = useAddUserBook()
  const { searchBooks } = useSearchBooks()
  const categories = ["자기계발", "개발", "역사", "소설", "에세이", "경제", "과학", "철학", "기타"]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      console.log('[AddBookDialog] handleSearch start, query=', searchQuery)
      const results = await searchBooks(searchQuery)
      console.log('[AddBookDialog] handleSearch results length=', Array.isArray(results) ? results.length : 'n/a')
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error("Search failed:", error)
      alert('책 검색에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectBook = (book: BookSearchResult) => {
    setTitle(book.title)
    setAuthor(book.author)
    setPublisher(book.publisher)
    setIsbn(book.isbn)
    setDescription(book.description)
    setCover(book.cover)
    setShowSearchResults(false)
    setMode("manual")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !author.trim() || !category) return

    setIsSubmitting(true)
    try {
      console.log('[AddBookDialog] handleSubmit fired')
      // Calculate progress from pages if provided
      const calculatedProgress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : progress

      const created = await addBook({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        category,
        progress: calculatedProgress,
        totalPages: totalPages || 0,
        imgUrl: cover || `/placeholder.svg?height=200&width=150&query=${encodeURIComponent(title + " book cover")}`,
        isbn: isbn.trim(),
        publisher: publisher.trim(),
        pubdate: pubdate || new Date().toISOString().split('T')[0],
      })
      console.log('[AddBookDialog] addBook ok, created id=', created?.id)

      // 사용자-책 연결 (요청: POST /api/v1/user-books, body: { userId, bookId })
      const createdBookId = (created && (created.id as number)) || null
      if (createdBookId) {
        try {
          console.log('[AddBookDialog] addUserBook start', { userId: 1, bookId: createdBookId })
          await addUserBook({ userId: 1, bookId: createdBookId })
          console.log('[AddBookDialog] addUserBook ok')
        } catch (linkErr) {
          console.error('사용자-책 연결 실패:', linkErr)
          // 링크 실패해도 책 생성 자체는 성공했으므로 알림만 표시
          alert('책은 추가되었지만 내 서재 연결에 실패했습니다.')
        }
      }

      // Reset form
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('책 추가 실패:', error)
      alert('책 추가에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setAuthor("")
    setCategory("")
    setProgress(0)
    setCurrentPage(0)
    setTotalPages(0)
    setPublisher("")
    setIsbn("")
    setDescription("")
    setCover("")
    setStartDate("")
    setEndDate("")
    setPubdate("")
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    setMode("search")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-secondary rounded-xl shadow-soft-lg">
        <DialogHeader>
          <DialogTitle className="text-gradient flex items-center gap-2">
            <BookOpen className="h-5 w-5" />새 책 추가
          </DialogTitle>
        </DialogHeader>

        {!showSearchResults ? (
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "search" ? "default" : "outline"}
                onClick={() => setMode("search")}
                className={mode === "search" ? "button-primary" : "border-accent text-accent hover:bg-accent/10"}
              >
                <Search className="h-4 w-4 mr-2" />책 검색
              </Button>
              <Button
                type="button"
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
                className={mode === "manual" ? "button-primary" : "border-accent text-accent hover:bg-accent/10"}
              >
                <Plus className="h-4 w-4 mr-2" />
                직접 입력
              </Button>
            </div>

            {/* Search Mode */}
            {mode === "search" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-cool font-medium">책 제목으로 검색</Label>
                  <div className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="검색할 책 제목을 입력하세요"
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="button-primary rounded-lg"
                    >
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
                  <p className="text-cool">책 제목을 검색하여 정보를 자동으로 가져오세요</p>
                  <p className="text-sm text-cool/70 mt-1">또는 '직접 입력' 탭에서 수동으로 입력할 수 있습니다</p>
                </div>
              </div>
            )}

            {/* Manual Input Mode */}
            {mode === "manual" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-cool font-medium">
                      책 제목 *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="책 제목을 입력하세요"
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author" className="text-cool font-medium">
                      저자 *
                    </Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="저자명을 입력하세요"
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-cool font-medium">
                      카테고리 *
                    </Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground">
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-secondary rounded-lg shadow-soft-lg">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-foreground hover:bg-muted rounded">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publisher" className="text-cool font-medium">
                      출판사
                    </Label>
                    <Input
                      id="publisher"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="출판사를 입력하세요"
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn" className="text-cool font-medium">
                      ISBN
                    </Label>
                    <Input
                      id="isbn"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="ISBN을 입력하세요"
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pubdate" className="text-cool font-medium">
                      출판일
                    </Label>
                    <Input
                      id="pubdate"
                      type="date"
                      value={pubdate}
                      onChange={(e) => setPubdate(e.target.value)}
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-cool font-medium">
                    책 설��
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="책에 대한 간단한 설명을 입력하세요"
                    className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool resize-none"
                    rows={3}
                  />
                </div>

                {/* Reading Dates */}
                <div className="space-y-4">
                  <Label className="text-cool font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    읽기 기간
                  </Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm text-cool">
                        읽기 시작일
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm text-cool">
                        읽기 완료일
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-cool font-medium">읽기 진행 상황</Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPage" className="text-sm text-cool">
                        현재 페이지
                      </Label>
                      <Input
                        id="currentPage"
                        type="number"
                        min="0"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        placeholder="0"
                        className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalPages" className="text-sm text-cool">
                        총 페이지
                      </Label>
                      <Input
                        id="totalPages"
                        type="number"
                        min="0"
                        value={totalPages}
                        onChange={(e) => setTotalPages(Number(e.target.value))}
                        placeholder="0"
                        className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="progress" className="text-sm text-cool">
                      읽기 진행률 (%){" "}
                      {totalPages > 0 &&
                        currentPage > 0 &&
                        `- 자동 계산: ${Math.round((currentPage / totalPages) * 100)}%`}
                    </Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={
                        totalPages > 0 && currentPage > 0 ? Math.round((currentPage / totalPages) * 100) : progress
                      }
                      onChange={(e) => setProgress(Number(e.target.value))}
                      placeholder="0"
                      disabled={totalPages > 0 && currentPage > 0}
                      className="border-secondary focus:border-accent bg-muted rounded-lg text-foreground placeholder:text-cool disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="border-accent text-accent hover:bg-accent/10 rounded-lg bg-transparent"
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={() => console.log('[AddBookDialog] submit button clicked')}
                    disabled={isSubmitting}
                    className="button-primary rounded-lg"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? "추가 중..." : "추가"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowSearchResults(false)}
                className="text-cool hover:bg-secondary rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                검색으로 돌아가기
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">검색 결과 ({searchResults.length})</h3>

              {searchResults.length === 0 ? (
                <Card className="border-secondary bg-muted/50 rounded-lg">
                  <CardContent className="p-6 text-center">
                    <Search className="h-8 w-8 text-cool mx-auto mb-2" />
                    <p className="text-cool">검색 결과가 없습니다</p>
                    <p className="text-sm text-cool/70">다른 키워드로 검색해보세요</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((book, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer card-hover border-secondary bg-card rounded-lg"
                      onClick={() => handleSelectBook(book)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-20 rounded bg-muted flex-shrink-0 overflow-hidden">
                            <img
                              src={book.cover || "/placeholder.svg"}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{book.title}</h4>
                            <p className="text-sm text-cool truncate">{book.author}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                                {book.publisher}
                              </Badge>
                              {book.isbn && (
                                <Badge variant="outline" className="text-xs border-cool/30 text-cool">
                                  ISBN: {book.isbn}
                                </Badge>
                              )}
                            </div>
                            {book.description && (
                              <p className="text-xs text-cool/70 mt-2 line-clamp-2">{book.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
