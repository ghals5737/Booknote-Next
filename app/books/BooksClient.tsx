'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAddBook, useBooks, useDeleteBook } from "@/hooks/use-books";
import {
  AlertCircle,
  Book,
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { UserBookResponse } from "../../lib/types/book/book";

export function BooksClient() {  
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // SWR 훅 사용
  const { books, pagination, isLoading, error, mutateBooks } = useBooks(0, 10);
  const { addBook } = useAddBook();
  const { deleteBook } = useDeleteBook();

  // 새 책 추가 상태
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    totalPages: '',
    coverImage: '',
    publisher: '',
    isbn: ''
  });

  const handleBookClick = (book: UserBookResponse) => {
    router.push(`/books/detail/${book.id}`);
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.description || !newBook.category || !newBook.totalPages) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      await addBook({
        title: newBook.title,
        author: newBook.author,
        description: newBook.description,
        category: newBook.category,
        totalPages: parseInt(newBook.totalPages),
        coverImage: newBook.coverImage || undefined,
        publisher: newBook.publisher || undefined,
        isbn: newBook.isbn || undefined,
      });

      // 폼 초기화
      setNewBook({
        title: '',
        author: '',
        description: '',
        category: '',
        totalPages: '',
        coverImage: '',
        publisher: '',
        isbn: ''
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error('책 추가 실패:', error);
      alert('책 추가에 실패했습니다.');
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

  // 필터링된 책 목록
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록
  const categories = ['all', ...Array.from(new Set(books.map(book => book.category)))];

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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="animate-slide-up">
              <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
              <p className="text-muted-foreground mt-1">
                총 {pagination?.totalElements || 0}권의 책
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutateBooks()}
                className="animate-slide-up"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="animate-slide-up">
                    <Plus className="h-4 w-4 mr-2" />
                    책 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 책 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">제목 *</label>
                        <Input
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          placeholder="책 제목"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">저자 *</label>
                        <Input
                          value={newBook.author}
                          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                          placeholder="저자명"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">설명 *</label>
                      <Textarea
                        value={newBook.description}
                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                        placeholder="책에 대한 간단한 설명"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">카테고리 *</label>
                        <Input
                          value={newBook.category}
                          onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                          placeholder="예: 소설, 자기계발, 기술서"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">총 페이지 *</label>
                        <Input
                          type="number"
                          value={newBook.totalPages}
                          onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                          placeholder="페이지 수"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">출판사</label>
                        <Input
                          value={newBook.publisher}
                          onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                          placeholder="출판사명"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">ISBN</label>
                        <Input
                          value={newBook.isbn}
                          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                          placeholder="ISBN 번호"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">표지 이미지 URL</label>
                      <Input
                        value={newBook.coverImage}
                        onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        취소
                      </Button>
                      <Button onClick={handleAddBook}>
                        추가
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="책 제목이나 저자로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '전체' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20">
            <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다' : '아직 추가된 책이 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? '다른 검색어나 필터를 시도해보세요' 
                : '첫 번째 책을 추가해보세요'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                책 추가하기
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredBooks.map((book) => (
              <Card 
                key={book.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleBookClick(book)}
              >
                {viewMode === 'list' ? (
                  <>
                    <div className="flex-shrink-0 p-4">
                      <div className="w-16 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {book.coverImage ? (
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            width={64}
                            height={80}
                            className="object-cover"
                          />
                        ) : (
                          <Book className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <CardHeader className="p-0 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{book.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id, book.title);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{book.author}</span>
                          {book.publisher && (
                            <>
                              <span>•</span>
                              <span>{book.publisher}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {book.description}
                        </p>
                                                 <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Badge variant="secondary">{book.category}</Badge>
                             {book.rating && book.rating > 0 && (
                               <Badge variant="outline">
                                 <Star className="h-3 w-3 mr-1" />
                                 {book.rating}
                               </Badge>
                             )}
                           </div>
                          <div className="text-sm text-muted-foreground">
                            {book.currentPage}/{book.totalPages} 페이지
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={book.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            진행도: {book.progress}%
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </>
                ) : (
                  <>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBook(book.id, book.title);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="line-clamp-1">{book.author}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-4">
                        {book.coverImage ? (
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            width={200}
                            height={200}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Book className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {book.description}
                      </p>
                                             <div className="flex items-center justify-between mb-3">
                         <Badge variant="secondary">{book.category}</Badge>
                         {book.rating && book.rating > 0 && (
                           <Badge variant="outline">
                             <Star className="h-3 w-3 mr-1" />
                             {book.rating}
                           </Badge>
                         )}
                       </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>진행도</span>
                          <span>{book.progress}%</span>
                        </div>
                        <Progress value={book.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{book.currentPage} / {book.totalPages} 페이지</span>
                          <span>{Math.round((book.currentPage / book.totalPages) * 100)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 