"use client";

import { Markdown } from "@/components/note/Markdown";
import NoteEditor from "@/components/note/NoteEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNextAuth } from "@/hooks/use-next-auth";
import { authenticatedApiRequest } from "@/lib/api/auth";
import { BookDetailData, NoteData, QuoteData } from "@/lib/types/book/book";
import { NoteResponse, NoteResponsePage } from "@/lib/types/note/note";
import { QuoteResponsePage } from "@/lib/types/quote/quote";
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
import useSWR from "swr";

interface BookDetailClientProps {
  bookId: string;
}

export default function BookDetailClient({ bookId }: BookDetailClientProps) {
  const router = useRouter();
  const { user } = useNextAuth();
  const userId = user?.id?.toString();
  const shouldFetch = !!userId && !!bookId;

  // SWR fetchers
  const fetcher = async <T,>(endpoint: string) => {
    const res = await authenticatedApiRequest<T>(endpoint);
    return res.data as unknown as T;
  };

  // Keys - 백엔드 API 스펙에 맞게 수정
  const bookKey = shouldFetch ? `/api/v1/books/${bookId}` : null;
  const quotesKey = shouldFetch ? `/api/v1/quotes/books/${bookId}?page=0&size=100&sort=created_at` : null;
  const notesKey = shouldFetch ? `/api/v1/notes/books/${bookId}?page=0&size=100&sort=created_at` : null;

  const { data: bookDetail, isLoading: bookLoading } = useSWR<BookDetailData>(bookKey, fetcher);
  const { data: quotesData, isLoading: quotesLoading, mutate: mutateQuotes } = useSWR<QuoteResponsePage>(quotesKey, fetcher);
  const { data: notesData, isLoading: notesLoading, mutate: mutateNotes } = useSWR<NoteResponsePage>(notesKey, fetcher);

  const currentQuotes: QuoteData[] = Array.isArray(quotesData?.content) ? quotesData.content : (quotesData as unknown as QuoteData[] ?? []);
  const currentNotes: NoteData[] = Array.isArray(notesData?.content) ? notesData.content : (notesData as unknown as NoteData[] ?? []);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newQuote, setNewQuote] = useState({ content: '', page: '', memo: '' });
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteData | null>(null);
  const [viewingQuote, setViewingQuote] = useState<QuoteData | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteData | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);



  // addNote 함수는 더 이상 사용하지 않음 (NoteEditor 사용)

  const addQuote = async () => {
    if (!newQuote.content.trim()) return;

    try {
      const payload = {
        text: newQuote.content,
        page: newQuote.page ? parseInt(newQuote.page) : 0,
        thoughts: newQuote.memo || '',
        isImportant: false
      };
      const res = await authenticatedApiRequest<QuoteData>(`/api/v1/books/${bookId}/quotes`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const created = res.data as QuoteData;
      await mutateQuotes(async (prev: QuoteResponsePage | undefined) => {
        const prevList = Array.isArray(prev?.content) ? prev.content : (prev as unknown as QuoteData[] ?? []);
        return { ...(prev || {}), content: [created, ...prevList] } as QuoteResponsePage;
      }, { revalidate: true });

      setNewQuote({ content: '', page: '', memo: '' });
      setIsAddingQuote(false);
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const deleteNote = async (noteId: number) => {
    try {
      await authenticatedApiRequest(`/api/v1/books/${bookId}/notes/${noteId}`, {
        method: 'DELETE'
      });
      await mutateNotes(async (prev: NoteResponsePage | undefined) => {
        const prevList = Array.isArray(prev?.content) ? prev.content : (prev as unknown as NoteData[] ?? []);
        return { ...(prev || {}), content: prevList.filter((n: NoteData) => n.id !== noteId) } as NoteResponsePage;
      }, { revalidate: true });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const deleteQuote = async (quoteId: number) => {
    try {
      await authenticatedApiRequest(`/api/v1/books/${bookId}/quotes/${quoteId}`, {
        method: 'DELETE'
      });
      await mutateQuotes(async (prev: QuoteResponsePage | undefined) => {
        const prevList = Array.isArray(prev?.content) ? prev.content : (prev as unknown as QuoteData[] ?? []);
        return { ...(prev || {}), content: prevList.filter((q: QuoteData) => q.id !== quoteId) } as QuoteResponsePage;
      }, { revalidate: true });
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  // updateNote 함수는 더 이상 사용하지 않음 (NoteEditor에서 처리)

  const updateQuote = async (updatedQuote: QuoteData) => {
    try {
      await authenticatedApiRequest(`/api/v1/books/${bookId}/quotes/${updatedQuote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          text: updatedQuote.content,
          page: updatedQuote.page,
          thoughts: updatedQuote.memo,
          isImportant: updatedQuote.isImportant
        })
      });

      // 서버 응답 형태와 무관하게 로컬 편집 값으로 낙관적 갱신
      await mutateQuotes(async (prev: QuoteResponsePage | undefined) => {
        const prevList = Array.isArray(prev?.content) ? prev.content : (prev as unknown as QuoteData[] ?? []);
        const nextList = prevList.map((q: QuoteData) =>
          q.id === updatedQuote.id
            ? {
                ...q,
                content: updatedQuote.content,
                page: updatedQuote.page,
                memo: updatedQuote.memo,
                isImportant: updatedQuote.isImportant,
              }
            : q
        );
        return { ...(prev || {}), content: nextList } as QuoteResponsePage;
      }, { revalidate: true });
      setEditingQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  // 노트 에디터 표시
  if (showNoteEditor) {
    return (
      <NoteEditor 
        preSelectedBookId={bookId}
        onSave={() => {
          setShowNoteEditor(false);
          mutateNotes();
        }}
        onCancel={() => setShowNoteEditor(false)}
      />
    );
  }

  // 노트 수정 모드
  if (editingNote) {
    return (
      <NoteEditor 
        initialNote={editingNote as NoteResponse}
        onSave={() => {
          setEditingNote(null);
          mutateNotes();
        }}
        onCancel={() => setEditingNote(null)}
      />
    );
  }

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
              <Markdown content={viewingNote.content} />
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

  // If viewing a specific quote, show quote detail view
  if (viewingQuote) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button 
          variant="ghost" 
          onClick={() => setViewingQuote(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Quote className="h-6 w-6" />
              좋아하는 문장
            </CardTitle>
            <CardDescription>
              {viewingQuote.page > 0 && (
                <Badge variant="secondary" className="mr-2">{viewingQuote.page}페이지</Badge>
              )}
              {viewingQuote.isImportant && (
                <Badge variant="destructive">
                  <Star className="h-3 w-3 mr-1" />
                  중요
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-foreground leading-relaxed">
                &quot;{viewingQuote.content}&quot;
              </blockquote>
              
              {viewingQuote.memo && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">메모</h4>
                  <div className="whitespace-pre-wrap text-foreground">
                    {viewingQuote.memo}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingQuote(viewingQuote)}
              >
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteQuote(viewingQuote.id)}
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

  if (bookLoading || quotesLoading || notesLoading || !bookDetail) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-muted-foreground">불러오는 중...</div>
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
            <Button onClick={() => setShowNoteEditor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              노트 추가
            </Button>
            {/* <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
              <DialogTrigger asChild>
                
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
            </Dialog> */}
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
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingQuote(quote)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuote(quote)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuote(quote.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <blockquote className="border-l-4 border-primary pl-4 italic text-foreground mb-3">
                      &quot;{quote.content.length > 100 ? quote.content.substring(0, 100) + '...' : quote.content}&quot;
                    </blockquote>
                    
                    {quote.memo && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <strong>메모:</strong> {quote.memo.length > 50 ? quote.memo.substring(0, 50) + '...' : quote.memo}
                      </div>
                    )}
                    
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 p-0 h-auto font-normal"
                      onClick={() => setViewingQuote(quote)}
                    >
                      자세히 보기 →
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Note Dialog - 이제 NoteEditor를 사용하므로 제거됨 */}

      {/* Edit Quote Dialog */}
      {editingQuote && (
        <Dialog open={!!editingQuote} onOpenChange={() => setEditingQuote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>좋아하는 문장 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-quote-content">문장</Label>
                <Textarea
                  id="edit-quote-content"
                  value={editingQuote.content}
                  onChange={(e) => setEditingQuote({ ...editingQuote, content: e.target.value })}
                  placeholder="인상 깊었던 문장을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="edit-quote-page">페이지 (선택사항)</Label>
                <Input
                  id="edit-quote-page"
                  type="number"
                  value={editingQuote.page}
                  onChange={(e) => setEditingQuote({ ...editingQuote, page: parseInt(e.target.value) || 0 })}
                  placeholder="페이지 번호"
                />
              </div>
              <div>
                <Label htmlFor="edit-quote-memo">메모 (선택사항)</Label>
                <Textarea
                  id="edit-quote-memo"
                  value={editingQuote.memo}
                  onChange={(e) => setEditingQuote({ ...editingQuote, memo: e.target.value })}
                  placeholder="이 문장에 대한 생각을 적어보세요"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingQuote(null)}>
                  취소
                </Button>
                <Button onClick={() => updateQuote(editingQuote)}>
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