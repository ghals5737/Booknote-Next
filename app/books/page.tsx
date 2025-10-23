import { UserBookResponsePage } from '@/lib/types/book/book';
import { BooksClient } from './BooksClient';

// SSR로 데이터 페칭 (클라이언트 사이드에서 인증 처리)
async function getBooksData(): Promise<UserBookResponsePage | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';
    
    // 클라이언트에서 인증을 처리하므로 서버에서는 기본 데이터만 반환
    // 실제 인증은 BooksClient에서 처리
    return null;
  } catch (error) {
    console.error('책 목록 조회 중 오류:', error);
    return null;
  }
}

export default async function BooksPage() {
  const booksData = await getBooksData();
  
  // 클라이언트에서 인증 처리하도록 변경
  return <BooksClient initialData={booksData || undefined} />;
}