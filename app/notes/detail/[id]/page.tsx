import { Suspense } from 'react';
import { NoteDetailClient } from './NoteDetailClient';

interface NoteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>노트를 불러오는 중...</span>
          </div>
        </div>
      </div>
    }>
      <NoteDetailClient noteId={id} />
    </Suspense>
  );
}