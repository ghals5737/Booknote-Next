import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Building,
    Calendar,
    Edit,
    Eye,
    FileText,
    Hash,
    Plus,
    Quote,
    Trash2,
    User
} from "lucide-react";
import { useState } from "react";
import NoteDetailView from "./NoteDetailView";

interface BookData {
  id: number;
  title: string;
  author: string;
  description: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  category: string;
  rating?: number;
  coverImage?: string;
  publisher?: string;
  isbn?: string;
  notes: Note[];
  quotes: Quote[];
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface Quote {
  id: number;
  content: string;
  page?: number;
  memo?: string;
  createdAt: string;
}

interface BookDetailProps {
  book: BookData;
  onBack: () => void;
  onUpdateBook: (book: BookData) => void;
}

const BookDetail = ({ book, onBack, onUpdateBook }: BookDetailProps) => {
  const [currentBook, setCurrentBook] = useState<BookData>(book);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [newQuote, setNewQuote] = useState({ content: '', page: '', memo: '' });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newNote.tags
    };

    const updatedBook = {
      ...currentBook,
      notes: [...currentBook.notes, note]
    };

    setCurrentBook(updatedBook);
    onUpdateBook(updatedBook);
    setNewNote({ title: '', content: '', tags: [] });
    setIsAddingNote(false);
  };

  const addQuote = () => {
    if (!newQuote.content.trim()) return;

    const quote: Quote = {
      id: Date.now(),
      content: newQuote.content,
      page: newQuote.page ? parseInt(newQuote.page) : undefined,
      memo: newQuote.memo,
      createdAt: new Date().toISOString()
    };

    const updatedBook = {
      ...currentBook,
      quotes: [...currentBook.quotes, quote]
    };

    setCurrentBook(updatedBook);
    onUpdateBook(updatedBook);
    setNewQuote({ content: '', page: '', memo: '' });
    setIsAddingQuote(false);
  };

  const deleteNote = (noteId: number) => {
    const updatedBook = {
      ...currentBook,
      notes: currentBook.notes.filter(note => note.id !== noteId)
    };
    setCurrentBook(updatedBook);
    onUpdateBook(updatedBook);
  };

  const deleteQuote = (quoteId: number) => {
    const updatedBook = {
      ...currentBook,
      quotes: currentBook.quotes.filter(quote => quote.id !== quoteId)
    };
    setCurrentBook(updatedBook);
    onUpdateBook(updatedBook);
  };

  const updateNote = (updatedNote: Note) => {
    const updatedBook = {
      ...currentBook,
      notes: currentBook.notes.map(note => 
        note.id === updatedNote.id 
          ? { ...updatedNote, updatedAt: new Date().toISOString() }
          : note
      )
    };
    setCurrentBook(updatedBook);
    onUpdateBook(updatedBook);
    setEditingNote(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If viewing a specific note, show note detail view
  if (viewingNote) {
    return (
      <NoteDetailView
        note={viewingNote}
        bookTitle={currentBook.title}
        onBack={() => setViewingNote(null)}
        onUpdateNote={updateNote}
        onDeleteNote={deleteNote}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="w-48 h-64 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {currentBook.coverImage ? (
                <img 
                  src={currentBook.coverImage} 
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentBook.title}
            </h1>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>{currentBook.author}</span>
              </div>
              {currentBook.publisher && (
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{currentBook.publisher}</span>
                </div>
              )}
              {currentBook.isbn && (
                <div className="flex items-center text-muted-foreground">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>{currentBook.isbn}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{currentBook.category}</Badge>
              {currentBook.rating && (
                <Badge variant="outline">⭐ {currentBook.rating}/5</Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-4">
              {currentBook.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>진행도: {currentBook.progress}%</span>
              <span>{currentBook.currentPage}/{currentBook.totalPages} 페이지</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            노트 ({currentBook.notes.length})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <Quote className="h-4 w-4" />
            좋아하는 문장 ({currentBook.quotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">노트</h2>
            <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  노트 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 노트 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="note-title">제목</Label>
                    <Input
                      id="note-title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="노트 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-content">내용</Label>
                    <Textarea
                      id="note-content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="노트 내용을 입력하세요 (마크다운 지원)"
                      className="min-h-[300px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                      취소
                    </Button>
                    <Button onClick={addNote}>
                      저장
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {currentBook.notes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 작성된 노트가 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    '노트 추가' 버튼을 클릭하여 첫 번째 노트를 작성해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentBook.notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <CardDescription>
                          {formatDate(note.createdAt)}
                          {note.updatedAt !== note.createdAt && (
                            <span className="ml-2">(수정됨: {formatDate(note.updatedAt)})</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingNote(note)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {note.content.substring(0, 150)}
                        {note.content.length > 150 && '...'}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto font-normal"
                        onClick={() => setViewingNote(note)}
                      >
                        자세히 보기 →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">좋아하는 문장</h2>
            <Dialog open={isAddingQuote} onOpenChange={setIsAddingQuote}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  문장 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>좋아하는 문장 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quote-content">문장</Label>
                    <Textarea
                      id="quote-content"
                      value={newQuote.content}
                      onChange={(e) => setNewQuote({ ...newQuote, content: e.target.value })}
                      placeholder="인상 깊었던 문장을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-page">페이지 (선택사항)</Label>
                    <Input
                      id="quote-page"
                      type="number"
                      value={newQuote.page}
                      onChange={(e) => setNewQuote({ ...newQuote, page: e.target.value })}
                      placeholder="페이지 번호"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quote-memo">메모 (선택사항)</Label>
                    <Textarea
                      id="quote-memo"
                      value={newQuote.memo}
                      onChange={(e) => setNewQuote({ ...newQuote, memo: e.target.value })}
                      placeholder="이 문장에 대한 생각을 적어보세요"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingQuote(false)}>
                      취소
                    </Button>
                    <Button onClick={addQuote}>
                      저장
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {currentBook.quotes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 저장된 문장이 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    '문장 추가' 버튼을 클릭하여 좋아하는 문장을 저장해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentBook.quotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(quote.createdAt)}
                        {quote.page && (
                          <>
                            <span>•</span>
                            <span>{quote.page}페이지</span>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuote(quote.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <blockquote className="border-l-4 border-primary pl-4 italic text-foreground mb-3">
                      "{quote.content}"
                    </blockquote>
                    
                    {quote.memo && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <strong>메모:</strong> {quote.memo}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>노트 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-note-title">제목</Label>
                <Input
                  id="edit-note-title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-note-content">내용</Label>
                <Textarea
                  id="edit-note-content"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="min-h-[300px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  취소
                </Button>
                <Button onClick={() => updateNote(editingNote)}>
                  저장
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BookDetail;