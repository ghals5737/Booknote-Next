'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBooks } from "@/hooks/use-books";
import { useNextAuth } from "@/hooks/use-next-auth";
import { useAddNote, useAddQuote } from "@/hooks/use-notes";
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Calendar,
  Code,
  Eye,
  EyeOff,
  Hash,
  Heart,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Palette,
  Plus,
  Quote,
  Save,
  Share,
  Tag,
  Trash2
} from "lucide-react";
import { useRef, useState } from "react";
import { Markdown } from "./Markdown";

const NoteEditor = () => {
  const { user } = useNextAuth();
  const { books, isLoading: booksLoading, error: booksError } = useBooks(0, 100); // 사용자 서재에서 책 목록 가져오기
  const [title, setTitle] = useState("새로운 노트");
  const [selectedBook, setSelectedBook] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [content, setContent] = useState(`# 마크다운 편집기

이곳에서 **마크다운**으로 노트를 작성할 수 있습니다.

## 주요 기능

- *기울임체*와 **굵은 글씨**
- [링크](https://example.com)
- \`인라인 코드\`

> 인용구는 이렇게 작성합니다.

### 연결된 노트
- [[원자 습관]] - 작은 변화의 힘
- [[학습 방법론]] - 효과적인 학습 전략

---

이 노트는 다른 노트들과 연결되어 지식 네트워크를 형성합니다.`);
  
  const [tags, setTags] = useState(["학습", "마크다운", "지식관리"]);
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 좋아하는 문장 관리
  const [favoriteQuotes, setFavoriteQuotes] = useState([
    {
      id: 1,
      text: "습관은 복리와 같다. 매일 1%씩 개선하면 1년 후 37배 더 나아진다.",
      page: 45,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      text: "작은 변화들이 쌓여서 놀라운 결과를 만든다.",
      page: 67,
      createdAt: "2024-01-16"
    }
  ]);
  const [newQuote, setNewQuote] = useState("");
  const [quotePage, setQuotePage] = useState("");

  // 하드코딩된 책 목록 제거 - useBooks 훅에서 가져옴
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addNote } = useAddNote();
  const { addQuote } = useAddQuote();

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!selectedBook) {
      alert('책을 선택해주세요.');
      return;
    }

    if (!user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await addNote({
        bookId: parseInt(selectedBook),
        title: title,
        content: content,
        html: content,
        isImportant: false,
        tagList: tags,
      });

      if (result) {
        // 좋아하는 문장들을 인용구로 저장
        if (favoriteQuotes.length > 0) {
          try {
            await Promise.all(
              favoriteQuotes.map((q) =>
                addQuote({
                  bookId: parseInt(selectedBook),
                  text: q.text,
                  page: q.page,
                })
              )
            );
          } catch (e) {
            console.error('일부 인용구 저장 실패:', e);
          }
        }
        alert('노트가 성공적으로 저장되었습니다.');
        setTitle("새로운 노트");
        setContent("");
        setSelectedBook("");
        setFavoriteQuotes([]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('노트 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    } else if (trimmedTag && tags.includes(trimmedTag)) {
      alert('이미 존재하는 태그입니다.');
    } else {
      alert('태그를 입력해주세요.');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addFavoriteQuote = () => {
    if (newQuote.trim()) {
      const quote = {
        id: favoriteQuotes.length + 1,
        text: newQuote.trim(),
        page: parseInt(quotePage) || 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      addQuote({
        bookId: parseInt(selectedBook),
        text: newQuote.trim(),
        page: parseInt(quotePage) || 0,
      });
      setFavoriteQuotes([...favoriteQuotes, quote]);
      setNewQuote("");
      setQuotePage("");
    }
  };

  const removeQuote = (quoteId: number) => {
    setFavoriteQuotes(favoriteQuotes.filter(quote => quote.id !== quoteId));
  };
 
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none shadow-none p-0 h-auto bg-transparent"
                placeholder="노트 제목..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
              <Button size="sm" onClick={saveNote} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>노트</span>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>좋아하는 문장</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes">
                <Card className="knowledge-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-primary" />
                        <span>마크다운 편집기</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                      </Button>
                    </div>
                
                {/* Toolbar */}
                <div className="flex items-center space-x-1 p-2 bg-muted/30 rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("**", "**")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("*", "*")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("- ")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("1. ")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("> ")}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("`", "`")}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("[", "](url)")}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("![](", ")")}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("[[", "]]")}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {/* Editor Pane */}
                  <div>
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="마크다운으로 노트를 작성하세요..."
                      className="min-h-[600px] font-mono text-sm leading-relaxed resize-none border-0 shadow-none p-4 bg-muted/20"
                    />
                  </div>
                  
                  {/* Preview Pane */}
                  {showPreview && (
                    <div className="border-l border-border pl-4">
                      <div className="min-h-[600px] p-4 bg-reading-bg rounded-lg">
                        <Markdown content={content} />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="quotes">
                <Card className="knowledge-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span>좋아하는 문장</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 새 문장 추가 */}
                      <div className="p-4 bg-muted/20 rounded-lg space-y-3">
                        <Textarea
                          value={newQuote}
                          onChange={(e) => setNewQuote(e.target.value)}
                          placeholder="마음에 드는 문장을 입력하세요..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={quotePage}
                            onChange={(e) => setQuotePage(e.target.value)}
                            placeholder="페이지"
                            className="w-20"
                          />
                          <Button onClick={addFavoriteQuote}>
                            <Plus className="h-4 w-4 mr-2" />
                            추가
                          </Button>
                        </div>
                      </div>

                      {/* 저장된 문장들 */}
                      <div className="space-y-3">
                        {favoriteQuotes.map((quote) => (
                          <Card key={quote.id} className="bg-gradient-warm">
                            <CardContent className="p-4">
                              <blockquote className="text-foreground mb-2 leading-relaxed">
                                {`"${quote.text}"`}
                              </blockquote>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {quote.page}페이지
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(quote.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuote(quote.id)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {favoriteQuotes.length === 0 && (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">아직 저장한 문장이 없습니다</h3>
                          <p className="text-muted-foreground">마음에 드는 문장을 저장해보세요</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Selection */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>소속 도서</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booksLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="text-sm text-muted-foreground">책 목록을 불러오는 중...</div>
                    </div>
                  ) : booksError ? (
                    <div className="text-sm text-red-500">책 목록을 불러오는데 실패했습니다.</div>
                  ) : books.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      아직 서재에 책이 없습니다.<br />
                      먼저 책을 추가해주세요.
                    </div>
                  ) : (
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="책을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => {
                          const truncatedTitle = book.title.length > 18 
                            ? `${book.title.substring(0, 18)}...` 
                            : book.title;
                          return (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              {truncatedTitle}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedBook && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">현재 페이지</label>
                      <Input
                        type="number"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        placeholder="페이지 번호"
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  {books.length === 0 && (
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      새 책 추가
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>태그</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="새 태그..."
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button size="sm" onClick={addTag}>
                      추가
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Linked Notes */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Link className="h-4 w-4 text-primary" />
                  <span>연결된 노트</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">원자 습관</p>
                    <p className="text-xs text-muted-foreground">작은 변화의 힘</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">학습 방법론</p>
                    <p className="text-xs text-muted-foreground">효과적인 학습 전략</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    노트 연결 추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="text-base">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    하이라이트 추가
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Hash className="h-4 w-4 mr-2" />
                    플래시카드 생성
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;