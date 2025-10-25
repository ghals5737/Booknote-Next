import { SWRProvider } from '@/components/providers/SWRProvider';
import { authOptions } from '@/lib/auth';
import { NoteResponsePage } from '@/lib/types/note/note';
import { QuoteResponsePage } from '@/lib/types/quote/quote';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';
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
  const notesData = await getNotesData();
  const quotesData = await getQuotesData();
  
  return (
    <SWRProvider>
      <Suspense fallback={
        <div className="p-6 space-y-6 bg-background min-h-full">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>노트 목록을 불러오는 중...</span>
            </div>
          </div>
        </div>
      }>
        <NotesClient initialData={{ notes: notesData, quotes: quotesData }} />
      </Suspense>
    </SWRProvider>
  );
}