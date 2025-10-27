'use client'

import { Markdown } from "@/components/note/Markdown";
import NoteEditor from "@/components/note/NoteEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteNote } from "@/hooks/use-notes";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { NoteResponse } from "@/lib/types/note/note";
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  Save,
  Star,
  Tag,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NoteDetailClientProps {
  noteId: string;
  initialData: NoteResponse;
}

export function NoteDetailClient({ noteId, initialData }: NoteDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<NoteResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { deleteNote } = useDeleteNote();
  
  // 초기 데이터 사용
  const note = initialData;

  // NEXT_PUBLIC_API_URL은 현재 사용되지 않음 (authenticatedApiRequest에서 처리)

  // 노트가 로드되면 편집용 상태 초기화
  useEffect(() => {
    setEditedNote(note);
  }, [note]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = async () => {
    if (!editedNote) return;

    setIsSaving(true);
    try {
      const result = await authenticatedApiRequest(`/api/v1/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editedNote.title,
          content: editedNote.content,
          html: editedNote.html || editedNote.content,
          isImportant: editedNote.isImportant
        })
      });

      // 로컬 상태 업데이트
      setEditedNote(result.data as NoteResponse);
      setIsEditing(false);
      alert('노트가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Error updating note:', error);
      alert('노트 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleImportant = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      const result = await authenticatedApiRequest(`/api/v1/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          html: note.html,
          isImportant: !note.isImportant
        })
      });

      // 로컬 상태 업데이트
      setEditedNote(result.data as NoteResponse);
      alert(`노트가 ${!note.isImportant ? '중요' : '일반'} 노트로 변경되었습니다.`);
    } catch (error) {
      console.error('Error updating note importance:', error);
      alert('중요표시 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(parseInt(noteId));
      alert('노트가 성공적으로 삭제되었습니다.');
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('노트 삭제에 실패했습니다.');
    }
    setShowDeleteDialog(false);
  };

  const handleCancel = () => {
    setEditedNote(note || null);
    setIsEditing(false);
  };


  // 초기 데이터가 없으면 에러 표시
  if (!note) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">노트를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">요청하신 노트가 존재하지 않거나 삭제되었습니다.</p>
            <Button onClick={() => router.push('/notes')}>
              노트 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }


  // 수정 모드일 때 NoteEditor 사용
  if (isEditing) {
    return <NoteEditor initialNote={note} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/notes')}
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
                  onClick={handleToggleImportant}
                  disabled={isSaving}
                  className={`flex items-center gap-2 ${note.isImportant ? 'text-yellow-600 hover:text-yellow-700' : ''}`}
                >
                  <Star className={`h-4 w-4 ${note.isImportant ? 'fill-current' : ''}`} />
                  {note.isImportant ? '중요 해제' : '중요 표시'}
                </Button>
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
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? '저장 중...' : '저장'}
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
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            {note.title}
            {note.isImportant && (
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            )}
          </h1>
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <Input
              value={editedNote?.title || ''}
              onChange={(e) => setEditedNote({ ...editedNote!, title: e.target.value })}
              className="text-3xl font-bold h-auto text-foreground border-none shadow-none px-0 flex-1"
              placeholder="노트 제목을 입력하세요"
            />
            {editedNote?.isImportant && (
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>작성: {note.startDate ? formatDate(note.startDate) : '날짜 정보 없음'}</span>
          </div>
          {note.updateDate && note.updateDate !== note.startDate && (
            <div className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>수정: {formatDate(note.updateDate)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {note.tagList && note.tagList.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {note.tagList.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
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
              <Markdown content={note.content} />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-content">내용</Label>
                <Textarea
                  id="note-content"
                  value={editedNote?.content || ''}
                  onChange={(e) => setEditedNote({ ...editedNote!, content: e.target.value })}
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
              &apos;{note.title}&apos; 노트를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
}