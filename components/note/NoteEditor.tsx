'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { NoteResponse } from "@/lib/types/note/note";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Share
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Markdown } from "./Markdown";

interface NoteEditorProps {
  initialNote?: NoteResponse;
  isEditMode?: boolean;
  bookId?: string;
}

const NoteEditor = ({ initialNote, isEditMode, bookId }: NoteEditorProps) => {  
  const router = useRouter();  
  
  const [title, setTitle] = useState(initialNote?.title || "새로운 노트");
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
          body: JSON.stringify({
            title: title,
            content: content,
            html: content,
            isImportant: initialNote.isImportant,
          })
        });
        alert('노트가 성공적으로 수정되었습니다.');
      } else {
        // 생성 모드
        const response = await fetch('/api/v1/notes', {
          method: 'POST',
          body: JSON.stringify({
            bookId: parseInt(bookId || ""),
            title: title,
            content: content,
            html: content,
            isImportant: false,
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
    if ((e.nativeEvent as any).isComposing) return; // IME 조합 중이면 기본 처리
  
    const textarea = e.currentTarget;
    const value = textarea.value;            // ⬅️ state 말고 실제 값 사용
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
  
    // 현재 줄 계산
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
  
    // 1) 리스트 자동완성
    const listMatch = currentLine.match(/^(\s*)([-*+]|(\d+)\.)\s/);
    if (listMatch) {
      e.preventDefault();
  
      const indent = listMatch[1] ?? '';
      const bullet = listMatch[2] ?? '';
      const num = listMatch[3]; // 캡처된 숫자(없으면 undefined)
  
      const nextMarker = num ? `${parseInt(num, 10) + 1}.` : bullet;
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

  // const removeTag = (tagToRemove: string) => {
  //   setTags(tags.filter(tag => tag !== tagToRemove));
  // };

 
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
                {isSaving ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정' : '저장')}
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
                      <CardTitle className="flex items-center space-x-2">                        
                        <span className="text-2xl font-semibold">새로운 노트 작성</span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;