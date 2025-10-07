'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useBooks } from "@/hooks/use-books";
import { useNextAuth } from "@/hooks/use-next-auth";
import { useAddNote } from "@/hooks/use-notes";
import { NoteResponse } from "@/lib/types/note/note";
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Code,
  Eye,
  EyeOff,
  Hash,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Plus,
  Quote,
  Save,
  Share,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "./Markdown";

interface NoteEditorProps {
  initialNote?: NoteResponse;
  onSave?: () => void;
  onCancel?: () => void;
  preSelectedBookId?: string;
}

const NoteEditor = ({ initialNote, onSave, onCancel, preSelectedBookId }: NoteEditorProps) => {
  const { user } = useNextAuth();
  const router = useRouter();
  const { books, isLoading: booksLoading, error: booksError } = useBooks(0, 100);
  
  // 수정 모드인지 확인
  const isEditMode = !!initialNote;
  
  const [title, setTitle] = useState(initialNote?.title || "새로운 노트");
  const [selectedBook, setSelectedBook] = useState(preSelectedBookId || initialNote?.bookId?.toString() || "");
  const [currentPage, setCurrentPage] = useState("");
  const [content, setContent] = useState(initialNote?.content || `# 마크다운 편집기

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
  
  const [tags, setTags] = useState(initialNote?.tagList || ["학습", "마크다운", "지식관리"]);
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 초기 노트 데이터로 상태 업데이트
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setSelectedBook(initialNote.bookId?.toString() || "");
      setContent(initialNote.content);
      setTags(initialNote.tagList || []);
    }
  }, [initialNote]);
  

  // 하드코딩된 책 목록 제거 - useBooks 훅에서 가져옴
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addNote } = useAddNote();

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
      if (isEditMode && initialNote) {
        // 수정 모드
        const { authenticatedApiRequest } = await import('@/lib/api/auth');
        await authenticatedApiRequest(`/api/v1/notes/${initialNote.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: title,
            content: content,
            html: content,
            isImportant: initialNote.isImportant,
            tagList: tags,
          })
        });
        alert('노트가 성공적으로 수정되었습니다.');
        onSave?.();
      } else {
        // 생성 모드
        const result = await addNote({
          bookId: parseInt(selectedBook),
          title: title,
          content: content,
          html: content,
          isImportant: false,
          tagList: tags,
        });

        if (result) {
          alert('노트가 성공적으로 저장되었습니다.');
          if (!onSave) {
            // 생성 모드에서만 초기화
            setTitle("새로운 노트");
            setContent("");
            setSelectedBook("");
          } else {
            onSave();
          }
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert(`노트 ${isEditMode ? '수정' : '저장'}에 실패했습니다.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
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

 
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isEditMode ? '취소' : '뒤로'}
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
                {isSaving ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정' : '저장')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
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

              {/* Note List */}
              {/* <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="text-base">노트 목록</CardTitle>
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
            </Card> */}

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

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;