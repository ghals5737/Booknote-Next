import { authOptions } from '@/lib/auth';
import { BookDetailData } from "@/lib/types/book/book";
import { getServerSession } from 'next-auth';
import NoteAddClient from "./NoteAddClient";

async function getBookDetail(bookId: string): Promise<BookDetailData | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return null;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500';
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/user/books/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Book detail fetch error:', error);
    return null;
  }
}

export default async function AddNotePage({ params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = await params
    const bookDetail = await getBookDetail(bookId);
    
    return (
        <NoteAddClient bookId={bookId} bookTitle={bookDetail?.title} />
    )
}