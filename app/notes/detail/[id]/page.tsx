import { authOptions } from '@/lib/auth';
import { NoteResponse } from '@/lib/types/note/note';
import { getServerSession } from 'next-auth';
import { NoteDetailClient } from './NoteDetailClient';

interface NoteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getNoteData(noteId: string): Promise<NoteResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';

  const response = await fetch(`${baseUrl}/api/v1/notes/${noteId}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('노트 데이터를 가져오는데 실패했습니다.');
  }

  const data = await response.json();
  return data.data || data;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;

  try {
    const initialData = await getNoteData(id);
    return (
      <NoteDetailClient 
        noteId={id} 
        initialData={initialData}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">오류가 발생했습니다</h1>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
            </p>
            <button
              onClick={() => globalThis.location.href = '/notes'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              노트 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }
}