import { LibraryHeader } from '@/components/library/library-header';
import { LibrarySearch } from '@/components/library/library-search';
import { LibraryTabs } from '@/components/library/library-tabs';
import { LibraryFolders } from '@/components/library/library-folders';
import { LibraryBooksGrid } from '@/components/library/library-books-grid';
import { authOptions } from '@/lib/auth';
import { UserBookResponsePage } from '@/lib/types/book/book';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { LibraryClient } from './LibraryClient';

async function getBooksData(): Promise<UserBookResponsePage | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return null;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
    const response = await fetch(`${baseUrl}/api/v1/user/books?page=0&size=100`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch books data:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching books data:', error);
    return null;
  }
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/auth');
  }

  const booksData = await getBooksData();
  
  if (!booksData) {
    const emptyData: UserBookResponsePage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 100,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
      pageable: {
        pageNumber: 0,
        pageSize: 100,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        offset: 0,
        paged: true,
        unpaged: false,
      },
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
    };
    return <LibraryClient booksData={emptyData} />;
  }
  
  return <LibraryClient booksData={booksData} />;
}
