import { authOptions } from '@/lib/auth';
import { UserBookResponsePage } from '@/lib/types/book/book';
import { getServerSession } from 'next-auth';
import { BooksClient } from './BooksClient';

// SSR로 데이터 페칭 (NextAuth.js 세션에서 토큰 가져오기)
async function getBooksData(): Promise<UserBookResponsePage> {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
        throw new Error('인증이 필요합니다.');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9100';
    
    const response = await fetch(`${baseUrl}/api/v1/user/books?page=0&size=10`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
}

export default async function BooksPage() {
  const booksData = await getBooksData();
  console.log('booksData', booksData);
  return <BooksClient initialData={booksData} />;
}