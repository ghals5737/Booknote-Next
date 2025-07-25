'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Book,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  User
} from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { UserBookResponse, UserBookResponsePage } from "../../lib/types/book/book";

export function BooksClient({ initialBooks }: { initialBooks: UserBookResponsePage }) {
  // const { books, isLoading, error, mutateBooks, setCurrentView, setSelectedBook } = useBook()
  const [books, setBooks] = useState<UserBookResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<Error | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // initialBooks가 있으면 SWR 캐시에 설정
  useEffect(() => {    
    if (initialBooks && initialBooks.content.length > 0) {      
      setIsLoading(false)
      setBooks(initialBooks.content)
    }
  }, [initialBooks])

  const [showAddDialog, setShowAddDialog] = useState(false)
  // const router = useRouter()

  const handleBookClick = (_book: UserBookResponse) => {
    // setSelectedBook(book)
    // setCurrentView("book-detail")
    // router.push(`/book`)
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
              // onClick={() => mutateBooks()}
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
      <div className="min-h-screen bg-background">
        
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-foreground">내 서재</h1>
                <Badge variant="secondary">{books.length}권</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="책 검색..."
                    //value={searchTerm}
                    //onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 pl-10"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
                
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      책 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>새 책 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">책 제목</label>
                        <Input
                            //value={newBook.title}
                            //onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          placeholder="책 제목을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">저자</label>
                        <Input
                          // value={newBook.author}
                          // onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                          placeholder="저자명을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">설명 (선택)</label>
                        <Textarea
                          //value={newBook.description}
                          //onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                          placeholder="책에 대한 간단한 설명"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">전체 페이지</label>
                          <Input
                            type="number"
                            //value={newBook.totalPages}
                            //onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                            placeholder="350"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">카테고리</label>
                          <Input
                            //value={newBook.category}
                            //onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                            placeholder="자기계발"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">읽기 시작일</label>
                        <Input
                          type="date"
                          //value={newBook.startDate}
                          //onChange={(e) => setNewBook({ ...newBook, startDate: e.target.value })}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          //onClick={addBook} 
                          className="flex-1">추가</Button>
                        <Button 
                          //onClick={() => setIsAddingBook(false)}
                          variant="outline" 
                        >취소</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>
  
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Books Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                  <CardHeader className="">
                    {book.coverImage && (
                      <div className="mb-3 overflow-hidden rounded-lg">
                        <Image 
                          src={book.coverImage} 
                          alt={book.title}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {book.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {book.rating && book.rating > 0 ? (
                          <div className="flex">                            
                            {Array.from({ length: book.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        ) : (
                          <div className="flex">
                            <Star className="h-3 w-3 fill-gray-400 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </CardHeader>
                  <CardContent>
                    {book.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {book.progress < 100 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>진행률</span>
                            <span>{book.progress}%</span>
                          </div>
                          <Progress value={book.progress} className="h-2" />
                          {book.totalPages && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {book.currentPage || 0} / {book.totalPages} 페이지
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          시작: {moment(book.startDate).format('YYYY-MM-DD')}
                        </div>
                        {book.updateDate && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            최근 수정일: {moment(book.updateDate).format('YYYY-MM-DD')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          노트 {book.noteCnt}개
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          문장 {book.quoteCnt}개
                        </span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => handleBookClick(book)}
                      >
                        상세보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <Card key={book.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {book.coverImage && (
                        <div className="flex-shrink-0">
                          <Image 
                            src={book.coverImage} 
                            alt={book.title}
                            width={400}
                            height={300}
                            className="w-20 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {book.category}
                          </Badge>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {book.title}
                          </h3>
                          {book.rating && (
                            <div className="flex ml-2">
                              {Array.from({ length: book.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {book.author}
                        </p>
                        
                        {book.description && (
                          <p className="text-muted-foreground mb-3 line-clamp-1">
                            {book.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {moment(book.startDate).format('YYYY-MM-DD')} ~ {moment(book.updateDate).format('YYYY-MM-DD')}
                          </span>
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            노트 {book.noteCnt}개
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            문장 {book.quoteCnt}개
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-primary mb-1">{book.progress}%</div>
                        {book.totalPages && (
                          <p className="text-xs text-muted-foreground">
                            {book.currentPage || 0} / {book.totalPages}p
                          </p>
                        )}
                        <Button 
                          size="sm"
                          className="bg-gradient-primary hover:opacity-90 mt-2"
                          onClick={() => handleBookClick(book)}
                        >
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
  
          {books.length === 0 && (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 키워드로 검색해보거나 새 책을 추가해보세요</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 책 추가
              </Button>
            </div>
          )}
        </div>
  
        {/* Floating Action Button */}
        <button 
          className="floating-action"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
  )
} 