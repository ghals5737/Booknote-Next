import { authOptions } from '@/lib/auth'
import { BookDetailData } from "@/lib/types/book/book"
import { NoteResponse } from "@/lib/types/note/note"
import { getServerSession } from 'next-auth'
import NoteDetailClient from "./NoteDetailClient"

async function getBookDetailData(bookId: string,noteId: string): Promise<{
    bookDetail: BookDetailData;
    notesDetail: NoteResponse;
  }> {

    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      throw new Error('인증이 필요합니다.');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
    
    try {
      // 병렬로 데이터 가져오기
      const [bookResponse, notesResponse] = await Promise.all([
        fetch(`${baseUrl}/api/v1/user/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        }),
        fetch(`${baseUrl}/api/v1/notes/${noteId}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        })
      ]);
  
      if (!bookResponse.ok) {
        throw new Error('책 정보를 가져오는데 실패했습니다.');
      }
  
      const bookDetail = await bookResponse.json();
      const notesDetail = notesResponse.ok ? await notesResponse.json() : null;
  
      return {
        bookDetail: bookDetail.data || bookDetail,
        notesDetail: notesDetail.data || notesDetail,
      };
    } catch (error) {
      console.error('Book detail data fetch error:', error);
      throw new Error('데이터를 가져오는데 실패했습니다.');
    }
  }

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ bookId: string; noteId: string }>
}) {
  const { bookId, noteId } = await params
  const initialData = await getBookDetailData(bookId, noteId)

  if (!initialData) {
    return <div>노트를 찾을 수 없습니다.</div>
  }

  return (
    <NoteDetailClient noteDetail={initialData.notesDetail} bookDetail={initialData.bookDetail} />
  )
}