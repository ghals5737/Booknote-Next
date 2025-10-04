'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBooks } from "@/hooks/use-books";
import { useAddNote, useDeleteNote, useNotes } from "@/hooks/use-notes";
import { NoteResponse } from "@/lib/types/note/note";
import {
  AlertCircle,
  Book,
  Calendar,
  FileText,
  Grid3X3,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Tag
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotesClient() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [sortByImportant, setSortByImportant] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('all');

  // SWR 훅 사용
  const { notes, pagination, isLoading, error, mutateNotes } = useNotes(0, 10);
  const { books, isLoading: booksLoading, error: booksError } = useBooks(0, 20);
  const { addNote } = useAddNote();
  const { deleteNote } = useDeleteNote();

  const handleNoteClick = (note: NoteResponse) => {
    console.log(note);
    router.push(`/notes/detail/${note.id}`);
  };

  const handleBookClick = (bookId: number) => {
    router.push(`/books/detail/${bookId}`);
  };

  const handleDeleteNote = async (noteId: number, noteTitle: string) => {
    if (confirm(`"${noteTitle}" 노트를 삭제하시겠습니까?`)) {
      try {
        await deleteNote(noteId);
        mutateNotes();
      } catch (error) {
        console.error('노트 삭제 실패:', error);
        alert('노트 삭제에 실패했습니다.');
      }
    }
  };

  // 필터링된 노트 목록
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tagList.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesImportant = showImportantOnly ? note.isImportant : true;
    
    return matchesSearch && matchesImportant;
  }).sort((a, b) => {
    if (sortByImportant) {
      // 중요 노트를 먼저, 그 다음 날짜순
      if (a.isImportant !== b.isImportant) {
        return Number(b.isImportant) - Number(a.isImportant);
      }
      const dateA = a.updateDate ? new Date(a.updateDate).getTime() : 0;
      const dateB = b.updateDate ? new Date(b.updateDate).getTime() : 0;
      return dateB - dateA;
    }
    // 기본 정렬: 날짜순
    const dateA = a.updateDate ? new Date(a.updateDate).getTime() : 0;
    const dateB = b.updateDate ? new Date(b.updateDate).getTime() : 0;
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">내 노트</h1>
            <p className="text-cool mt-1">노트 목록을 불러오는 중...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-cool">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>노트 목록을 불러오는 중...</span>
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
            <h1 className="text-3xl font-bold text-foreground">내 노트</h1>
            <p className="text-cool mt-1">오류가 발생했습니다</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-cool">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <span>노트 목록을 불러오는 중 오류가 발생했습니다</span>
            <Button 
              onClick={() => mutateNotes()}
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">내 노트</h1>
              <Badge variant="secondary">{filteredNotes.length}개</Badge>
              {books && books.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {books.length}권의 책
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="노트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10"
                />
              </div>
              
              <Button 
                variant={showImportantOnly ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowImportantOnly(!showImportantOnly)}
              >
                <Star className="h-4 w-4 mr-2" />
                중요 노트만
              </Button>
              
              <Button 
                variant={sortByImportant ? "default" : "outline"} 
                size="sm"
                onClick={() => setSortByImportant(!sortByImportant)}
              >
                <Star className="h-4 w-4 mr-2" />
                중요순 정렬
              </Button>

              {/* 책 선택 드롭다운 */}
              {books && books.length > 0 && (
                <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="책 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 책</SelectItem>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id.toString()}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
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
              
              <Button
                onClick={() => router.push('/notes/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                새 노트
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 노트 목록 섹션 */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">내 노트</h2>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300"
              onClick={() => handleNoteClick(note)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                     <Book className="h-4 w-4 mr-1" />
                      <Badge variant="secondary" className="text-xs">
                        {note.tagName}
                      </Badge>
                      {note.isImportant && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{moment(note.updateDate).format('YYYY-MM-DD')}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
                    {note.title}
                    {note.isImportant && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {note.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tagList.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">                    
                  <span className="flex items-center">                        
                  </span>
                    <span className="truncate ml-2">{note.bookTitle}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300"
              onClick={() => handleNoteClick(note)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {/* {getTypeIcon(note.type)} */}
                          <Badge variant="secondary" className="text-xs">
                            {note.tagName}
                          </Badge>
                          {note.isImportant && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {note.title}
                          {note.isImportant && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {note.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {moment(note.updateDate).format('YYYY-MM-DD')}
                        </span>
                        <span className="flex items-center">                        
                        </span>
                        <span className="truncate">{note.bookTitle}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {note.tagList.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {note.tagList.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tagList.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 키워드로 검색해보세요</p>
            <Button onClick={() => router.push('/notes/create')}>
              <Plus className="h-4 w-4 mr-2" />
              새 노트 작성
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        className="floating-action"
        onClick={() => router.push('/notes/create')}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
