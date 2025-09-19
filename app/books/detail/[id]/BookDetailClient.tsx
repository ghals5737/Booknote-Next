"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookDetailData, NoteData, QuoteData } from "@/lib/types/book/book";
import {
    ArrowLeft,
    Building,
    Edit,
    Eye,
    FileText,
    Hash,
    Plus,
    Quote,
    Star,
    Trash2,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookDetailClientProps {
  bookDetail: BookDetailData;
  quotes: QuoteData[];
  notes: NoteData[];
  bookId: string;
}

export default function BookDetailClient({ 
  bookDetail, 
  quotes, 
  notes, 
  bookId 
}: BookDetailClientProps) {
  const router = useRouter();
  const { user } = useNextAuth();
  const [currentQuotes, setCurrentQuotes] = useState<QuoteData[]>(quotes);
  const [currentNotes, setCurrentNotes] = useState<NoteData[]>(notes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tagName: '' });
  const [newQuote, setNewQuote] = useState({ content: '', page: '', memo: '' });
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteData | null>(null);



  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'}/api/v1/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          bookId: parseInt(bookId),
          title: newNote.title,
          content: newNote.content,
          html: '',
          isImportant: false
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newNoteData = {
          id: result.data.id,
          bookId: result.data.bookId,
          title: result.data.title,
          content: result.data.content,
          html: result.data.html,
          isImportant: result.data.isImportant,
          tagName: '',
          tagList: []
        };
        setCurrentNotes([newNoteData, ...currentNotes]);
        setNewNote({ title: '', content: '', tagName: '' });
        setIsAddingNote(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const addQuote = async () => {
    if (!newQuote.content.trim()) return;

    try {
      const response = await fetch(`http://localhost:9377/api/v1/quotes/users/1/books/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newQuote.content,
          page: newQuote.page ? parseInt(newQuote.page) : 0,
          memo: newQuote.memo || '',
          isImportant: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQuotes([data.data, ...currentQuotes]);
        setNewQuote({ content: '', page: '', memo: '' });
        setIsAddingQuote(false);
      }
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const deleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`http://localhost:9377/api/v1/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentNotes(currentNotes.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const deleteQuote = async (quoteId: number) => {
    try {
      const response = await fetch(`http://localhost:9377/api/v1/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentQuotes(currentQuotes.filter(quote => quote.id !== quoteId));
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const updateNote = async (updatedNote: NoteData) => {
    try {
      const response = await fetch(`http://localhost:9377/api/v1/notes/${updatedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedNote.title,
          content: updatedNote.content,
          tagName: updatedNote.tagName,
          isImportant: updatedNote.isImportant
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentNotes(currentNotes.map(note => 
          note.id === updatedNote.id ? data.data : note
        ));
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // If viewing a specific note, show note detail view
  if (viewingNote) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button 
          variant="ghost" 
          onClick={() => setViewingNote(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{viewingNote.title}</CardTitle>
            <CardDescription>
              {viewingNote.tagName && (
                <Badge variant="secondary" className="mr-2">{viewingNote.tagName}</Badge>
              )}
              {viewingNote.isImportant && (
                <Badge variant="destructive">
                  <Star className="h-3 w-3 mr-1" />
                  중요
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {viewingNote.content}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingNote(viewingNote)}
              >
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteNote(viewingNote.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="w-48 h-64 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {bookDetail.coverImage ? (
                <img 
                  src={bookDetail.coverImage} 
                  alt={bookDetail.title}
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
              {bookDetail.title}
            </h1>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>{bookDetail.author}</span>
              </div>
              {bookDetail.publisher && (
                <div className="flex items-center text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{bookDetail.publisher}</span>
                </div>
              )}
              {bookDetail.isbn && (
                <div className="flex items-center text-muted-foreground">
                  <Hash className="h-4 w-4 mr-2" />
                  <span>{bookDetail.isbn}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{bookDetail.category}</Badge>
              {bookDetail.rating > 0 && (
                <Badge variant="outline">⭐ {bookDetail.rating}/5</Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-4">
              {bookDetail.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>진행도: {bookDetail.progress}%</span>
              <span>{bookDetail.currentPage}/{bookDetail.totalPages} 페이지</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            노트 ({currentNotes.length})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <Quote className="h-4 w-4" />
            좋아하는 문장 ({currentQuotes.length})
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
                      placeholder="노트 내용을 입력하세요"
                      className="min-h-[300px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-tag">태그 (선택사항)</Label>
                    <Input
                      id="note-tag"
                      value={newNote.tagName}
                      onChange={(e) => setNewNote({ ...newNote, tagName: e.target.value })}
                      placeholder="태그를 입력하세요"
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
            {currentNotes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 작성된 노트가 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    &apos;노트 추가&apos; 버튼을 클릭하여 첫 번째 노트를 작성해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <CardDescription>
                          {note.tagName && (
                            <Badge variant="secondary" className="mr-2">{note.tagName}</Badge>
                          )}
                          {note.isImportant && (
                            <Badge variant="destructive">
                              <Star className="h-3 w-3 mr-1" />
                              중요
                            </Badge>
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
            {currentQuotes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">아직 저장된 문장이 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    &apos;문장 추가&apos; 버튼을 클릭하여 좋아하는 문장을 저장해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentQuotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {quote.page > 0 && (
                          <>
                            <span>{quote.page}페이지</span>
                            <span>•</span>
                          </>
                        )}
                        {quote.isImportant && (
                          <Badge variant="destructive" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            중요
                          </Badge>
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
                      &quot;{quote.content}&quot;
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
              <div>
                <Label htmlFor="edit-note-tag">태그</Label>
                <Input
                  id="edit-note-tag"
                  value={editingNote.tagName}
                  onChange={(e) => setEditingNote({ ...editingNote, tagName: e.target.value })}
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
}