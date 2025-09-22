'use client'

import { AddBookDialog } from "@/components/book/AddBookDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useBooks, useDeleteBook, useSearchBooks } from "@/hooks/use-books";
import { useNextAuth } from "@/hooks/use-next-auth";
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
  LogIn,
  Plus,
  RefreshCw,
  Search,
  Star,
  User
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserBookResponse } from "../../lib/types/book/book";

export function BooksClient() {  
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [externalSearchResults, setExternalSearchResults] = useState<any[]>([]);
  const [isExternalSearching, setIsExternalSearching] = useState(false);
  const [showExternalResults, setShowExternalResults] = useState(false);
  const [selectedBookForAdd, setSelectedBookForAdd] = useState<any>(null);

  const { isAuthenticated, isLoading: authLoading } = useNextAuth();

  // SWR 훅 사용
  const { books, pagination, isLoading, error, mutateBooks } = useBooks(0, 10);
  const { deleteBook } = useDeleteBook();
  const { searchBooks } = useSearchBooks();

  const handleBookClick = (book: UserBookResponse) => {
    console.log('상세보기 버튼 클릭됨:', book);
    try {
      router.push(`/books/detail/${book.id}`);
    } catch (error) {
      console.error('네비게이션 오류:', error);
    }
  };

  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    if (confirm(`"${bookTitle}" 책을 삭제하시겠습니까?`)) {
      try {
        await deleteBook(bookId);
      } catch (error) {
        console.error('책 삭제 실패:', error);
        alert('책 삭제에 실패했습니다.');
      }
    }
  };

  const handleExternalSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsExternalSearching(true);
    try {
      console.log('[BooksClient] 외부 검색 시작:', searchTerm);
      
      // 백엔드 API 사용 (네이버 검색 API)
      const results = await searchBooks(searchTerm);
      console.log('[BooksClient] 외부 검색 결과:', results?.length || 0, '개');
      
      // 백엔드 응답을 우리 형식으로 변환
      const books = (results || []).map((item: any) => ({
        title: item.title || '제목 없음',
        author: item.author || '저자 없음',
        publisher: item.publisher || '출판사 없음',
        isbn: item.isbn || 'ISBN 없음',
        description: item.description || '설명 없음',
        cover: item.image || '/placeholder.svg'
      }));
      
      console.log('[BooksClient] 변환된 책 목록:', books);
      setExternalSearchResults(books);
      setShowExternalResults(true);
    } catch (error) {
      console.error('외부 검색 실패:', error);
      alert('책 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExternalSearching(false);
    }
  };

  // 필터링된 책 목록
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록
  const categories = ['all', ...Array.from(new Set(books.map(book => book.category)))];

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
            <p className="text-cool mt-1">로그인이 필요한 서비스입니다</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-cool">
            <LogIn className="h-12 w-12" />
            <span>로그인 후 내 서재를 이용할 수 있어요</span>
            <Button onClick={() => router.push('/auth')} className="mt-4">
              로그인하러 가기
            </Button>
          </div>
        </div>
      </div>
    );
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
    );
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
            <div className="text-sm text-muted-foreground mt-2">
              오류: {error.message || '알 수 없는 오류'}
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => mutateBooks()}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
              <Button 
                onClick={() => {
                  // 토큰 확인 및 재로그인 안내
                  const token = localStorage.getItem('access_token');
                  if (!token) {
                    alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                    router.push('/auth');
                  } else {
                    mutateBooks();
                  }
                }}
                variant="default"
              >
                <LogIn className="h-4 w-4 mr-2" />
                로그인 확인
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">내 서재</h1>
              <Badge variant="secondary">{filteredBooks.length}권</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="책 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-80 pl-10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleExternalSearch();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleExternalSearch}
                  disabled={isExternalSearching || !searchTerm.trim()}
                  variant="outline"
                  size="sm"
                >
                  {isExternalSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
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
              
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                책 추가
              </Button>
              
              <AddBookDialog 
                open={showAddDialog} 
                onOpenChange={(open) => {
                  setShowAddDialog(open);
                  if (!open) {
                    setSelectedBookForAdd(null);
                  }
                }} 
                selectedBook={selectedBookForAdd}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* External Search Results */}
        {showExternalResults && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">검색 결과 ({externalSearchResults.length}개)</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExternalResults(false)}
              >
                검색 결과 닫기
              </Button>
            </div>
            
            {externalSearchResults.length === 0 ? (
              <Card className="border-secondary bg-muted/50 rounded-lg">
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">검색 결과가 없습니다</p>
                  <p className="text-sm text-muted-foreground/70">다른 키워드로 검색해보세요</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {externalSearchResults.map((book, index) => (
                  <Card key={index} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                    <CardHeader className="pb-3">
                      {book.cover && (
                        <div className="mb-3 overflow-hidden rounded-lg">
                          <img 
                            src={book.cover} 
                            alt={book.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {book.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      {book.publisher && (
                        <Badge variant="secondary" className="text-xs w-fit max-w-full overflow-hidden">
                          <span className="truncate">{book.publisher}</span>
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {book.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {book.description}
                        </p>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => {
                          setSelectedBookForAdd(book);
                          setShowAddDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        내 서재에 추가
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Books Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardHeader className="pb-3">
                  {book.coverImage && (
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {book.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {book.rating && (
                        <div className="flex">
                          {Array.from({ length: book.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
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
                          완료: {moment(book.updateDate).format('YYYY-MM-DD')}
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
                      className="w-full bg-gradient-primary hover:opacity-90 relative z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('버튼 클릭 이벤트 발생:', book.id, book.title);
                        alert(`상세보기 클릭: ${book.title}`);
                        handleBookClick(book);
                      }}
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
            {filteredBooks.map((book) => (
              <Card key={book.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {book.coverImage && (
                      <div className="flex-shrink-0">
                        <img 
                          src={book.coverImage} 
                          alt={book.title}
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
                        className="bg-gradient-primary hover:opacity-90 mt-2 relative z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('리스트 뷰 버튼 클릭 이벤트 발생:', book.id, book.title);
                          alert(`상세보기 클릭: ${book.title}`);
                          handleBookClick(book);
                        }}
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

        {filteredBooks.length === 0 && (
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
  );
} 