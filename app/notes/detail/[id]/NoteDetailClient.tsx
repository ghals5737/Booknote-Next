'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NoteResponse } from "@/lib/types/note/note";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Save,
  Tag,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

interface NoteDetailViewProps {
  note: NoteResponse;
}



const NoteDetailView = ({ note }: NoteDetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<NoteResponse>(note);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  ;


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = () => {
    const updatedNote = {
      ...editedNote,
      updatedAt: new Date().toISOString()
    };
    onUpdateNote(updatedNote);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteNote(note.id);
    setShowDeleteDialog(false);
    onBack();
  };

  const handleCancel = () => {
    setEditedNote(note);
    setIsEditing(false);
  };

  // Simple markdown preview renderer
  const renderMarkdownPreview = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-foreground">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      .replace(/\[\[(.*?)\]\]/g, '<a href="#" class="text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-foreground">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-foreground">$1. $2</li>')
      .replace(/^---$/gm, '<hr class="my-6 border-border">')
      .replace(/\n\n/g, '</p><p class="mb-4 text-foreground leading-relaxed">')
      .replace(/\n/g, '<br>');
  };

  const processedContent = `<p class="mb-4 text-foreground leading-relaxed">${renderMarkdownPreview("")}</p>`;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost"             
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  저장
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Book info */}
        <div className="text-sm text-muted-foreground mb-2">
          <span>{note.bookTitle}</span>
        </div>

        {/* Note title */}
        {!isEditing ? (
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {note.title}
          </h1>
        ) : (
          <Input
            value={editedNote.title}
            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
            className="text-3xl font-bold mb-2 h-auto text-foreground border-none shadow-none px-0"
            placeholder="노트 제목을 입력하세요"
          />
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>작성: {note.startDate}</span>
          </div>
          {note.updateDate !== note.startDate && (
            <div className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>수정: {note.updateDate}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {note.tagList.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {note.tagList.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            노트 내용
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="prose prose-sm max-w-none">
              <div 
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-content">내용</Label>
                <Textarea
                  id="note-content"
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  placeholder="노트 내용을 입력하세요 (마크다운 지원)"
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>노트 삭제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {`'${note.title}' 노트를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteDetailView;