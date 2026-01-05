'use client'
import { Markdown } from "@/components/note/Markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NoteResponse } from "@/lib/types/note/note";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Save,
  Share,
  Tag,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NoteEditorProps {
  initialNote?: NoteResponse;
  isEditMode?: boolean;
  bookId?: string;
  bookTitle?: string;
}

const NoteEditor = ({ initialNote, isEditMode, bookId, bookTitle }: NoteEditorProps) => {  
  const router = useRouter();  
  
  const [title, setTitle] = useState(initialNote?.title || "새로운 노트");
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
  
  const [tags, setTags] = useState<string[]>(initialNote?.tagList || []);
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 초기 노트 데이터로 상태 업데이트
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTags(initialNote.tagList || []);
    }
  }, [initialNote]);
  

  // 하드코딩된 책 목록 제거 - useBooks 훅에서 가져옴
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode && initialNote) {
        await fetch(`/api/v1/notes/${initialNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title,
            content: content,
            html: content,
            isImportant: initialNote.isImportant,
            tagList: tags,
          })
        });
        alert('노트가 성공적으로 수정되었습니다.');
      } else {
        // 생성 모드
        const response = await fetch('/api/v1/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId: Number.parseInt(bookId || "", 10),
            title: title,
            content: content,
            html: content,
            isImportant: false,
            tagList: tags,
          })
        });
        const result = await response.json();
        if (result.success) {
          alert('노트가 성공적으로 저장되었습니다.');
        } else {
          alert('노트 저장에 실패했습니다.');
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
    router.back();
  };

  // 향후 마크다운 툴바에서 사용될 예정
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    if ((e.nativeEvent as KeyboardEvent & { isComposing?: boolean }).isComposing) return; // IME 조합 중이면 기본 처리
  
    const textarea = e.currentTarget;
    const value = textarea.value;            // ⬅️ state 말고 실제 값 사용
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
  
    // 현재 줄 계산
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
  
    // 1) 리스트 자동완성
    const listRegex = /^(\s*)([-*+]|(\d+)\.)\s/;
    const listMatch = listRegex.exec(currentLine);
    if (listMatch) {
      e.preventDefault();
  
      const indent = listMatch[1] ?? '';
      const bullet = listMatch[2] ?? '';
      const num = listMatch[3]; // 캡처된 숫자(없으면 undefined)
  
      const nextMarker = num ? `${Number.parseInt(num, 10) + 1}.` : bullet;
      const insert = `\n${indent}${nextMarker} `;
  
      // 새 내용(항상 value 기준으로 생성)
      const newValue = value.slice(0, start) + insert + value.slice(end);
  
      // 상태 업데이트(함수형)
      setContent(() => newValue);
  
      // 커서 이동(렌더 후)
      const newCursorPos = start + insert.length;
      requestAnimationFrame(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
      return;
    }
  
    // 2) 코드펜스 자동 닫기
    if (currentLine.trim().startsWith('```')) {
      e.preventDefault();
  
      const insert = `\n\`\`\`\n`;
      const newValue = value.slice(0, start) + insert + value.slice(end);
  
      setContent(() => newValue);
  
      const newCursorPos = start + 1; // ``` 뒤 줄 시작
      requestAnimationFrame(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
      return;
    }
  
    // 3) 일반 줄바꿈
    e.preventDefault();
  
    const insert = `\n`;
    const newValue = value.slice(0, start) + insert + value.slice(end);
  
    setContent(() => newValue);
  
    const newCursorPos = start + insert.length;
    requestAnimationFrame(() => {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };
  

  const addTag = () => {
    const trimmedInput = newTag.trim();
    if (!trimmedInput) {
      alert('태그를 입력해주세요.');
      return;
    }

    // 쉼표로 구분된 여러 태그 처리
    const tagList = trimmedInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tagList.length === 0) {
      alert('태그를 입력해주세요.');
      return;
    }

    // 중복 제거 및 새 태그만 추가
    const newTags = tagList.filter(tag => !tags.includes(tag));
    const duplicates = tagList.filter(tag => tags.includes(tag));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
    }

    if (duplicates.length > 0) {
      alert(`다음 태그는 이미 존재합니다: ${duplicates.join(', ')}`);
    }

    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',') {
      // 쉼표 입력 시에도 태그 추가 (쉼표는 입력되지 않음)
      e.preventDefault();
      const currentValue = e.currentTarget.value;
      const commaIndex = currentValue.indexOf(',');
      if (commaIndex > 0) {
        const tagBeforeComma = currentValue.substring(0, commaIndex).trim();
        const remainingText = currentValue.substring(commaIndex + 1).trim();
        
        if (tagBeforeComma && !tags.includes(tagBeforeComma)) {
          setTags([...tags, tagBeforeComma]);
          setNewTag(remainingText);
        } else {
          setNewTag(remainingText);
        }
      }
    }
  };

 
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isEditMode ? '취소' : '뒤로'}
              </Button>
             
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
              <Button size="sm" onClick={saveNote} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {(() => {
                  if (isSaving) {
                    return isEditMode ? '수정 중...' : '저장 중...';
                  }
                  return isEditMode ? '수정' : '저장';
                })()}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">

        <div>
          {/* Editor */}
          <div>
                <Card className="knowledge-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">                        
                        <span className="text-2xl font-semibold">새로운 노트 작성</span>
                        {bookTitle && (
                          <Badge variant="secondary" className="text-sm">
                            <BookOpen className="h-3 w-3" />
                            {bookTitle}
                          </Badge>
                        )}
                      </CardTitle>
                     
                    </div>
                
                {/* Toolbar */}
                <div className="space-y-2 mt-4">
                  <Label className="text-xl font-semibold">노트 제목</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl "
                    placeholder="노트 제목..."
                  />
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Label className="text-xl font-semibold ">노트 내용</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                  </Button>
                </div>
                {/* <div className="flex justify-between items-center space-x-1 p-2 ">
                <div className="bg-muted/30 rounded-lg">
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
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("\n")}
                    title="줄바꿈"
                  >
                    ↵
                  </Button>
                  </div>
                 
                </div> */}
                  </CardHeader>
              
              <CardContent>            
                <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4 border-t border-border pt-4`}>
                  {/* Editor Pane */}
                  <div>
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="마크다운으로 노트를 작성하세요... (Enter로 줄바꿈)"
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
                <div className="space-y-2 mt-4 border-t border-border pt-4">
                  <Label className="text-xl font-semibold">태그</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors px-3 py-1"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                          aria-label={`${tag} 태그 제거`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="태그 입력 후 Enter 또는 쉼표로 추가..."
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addTag} type="button">
                      추가
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    여러 태그를 쉼표(,) 또는 공백으로 구분하여 입력할 수 있습니다.
                  </p>
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