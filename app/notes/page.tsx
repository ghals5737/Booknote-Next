import { authOptions } from '@/lib/auth';
import { NoteResponsePage } from '@/lib/types/note/note';
import { QuoteResponsePage } from '@/lib/types/quote/quote';
import { getServerSession } from 'next-auth';
import { NotesClient } from './NotesClient';

// SSR로 데이터 페칭
async function getNotesData(): Promise<NoteResponsePage> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';
  
  const response = await fetch(`${baseUrl}/api/v1/notes/user?page=0&size=100`,
    {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('노트 데이터를 가져오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

async function getQuotesData(): Promise<QuoteResponsePage> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';
  
  const response = await fetch(`${baseUrl}/api/v1/quotes/user?page=0&size=100`,
    {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('인용구 데이터를 가져오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

export default async function NotesPage() {
  try {
    const notesData = await getNotesData();
    const quotesData = await getQuotesData();
    
    return (
      <NotesClient initialData={{ notes: notesData, quotes: quotesData }} />
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
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }
}