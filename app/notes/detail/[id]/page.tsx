import { NoteResponse } from "@/lib/types/note/note";
import NoteDetailClient from "./NoteDetailClient";

interface NoteDetailPageProps {
    params: {
        id: string;
    };
}

async function getNote(noteId: string): Promise<NoteResponse> {
    const response = await fetch(`http://localhost:9377/api/v1/notes/${noteId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch book notes');
    }
    
    const data = await response.json();
    return data.data;
  }

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
    try {
    const note = await getNote(params.id);
    //   const [bookDetail, quotes, notes] = await Promise.all([
    //     getBookDetail(params.id),
    //     getBookQuotes(params.id),
    //     getBookNotes(params.id)
    //   ]);
    console.log('note', note);
  
      return (
        <NoteDetailClient 
          note={note}
        />
      );
    } catch (error) {
      console.error('Error fetching book detail:', error);
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                책 정보를 불러올 수 없습니다
              </h1>
              <p className="text-muted-foreground">
                잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }