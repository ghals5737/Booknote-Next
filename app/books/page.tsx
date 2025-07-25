import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { UserBookResponsePage } from '../../lib/types/book/book';
import { BooksClient } from './BooksClient';
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
// 서버사이드에서 초기 데이터 가져오기
async function getInitialBooks(): Promise<UserBookResponsePage> {
  try {
    const response = await (await fetch(`${NEXT_PUBLIC_API_URL}/api/v1/users/1/books?page=0&size=10`)).json()
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching initial books:', error)
    return {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        sort: { empty: false, sorted: false, unsorted: true },
        offset: 0,
        paged: true,
        unpaged: false
      },
      last: false,
      totalPages: 0,
      totalElements: 0,
      size: 10,
      number: 0,
      sort: { empty: false, sorted: false, unsorted: true },
      first: true,
      numberOfElements: 0,
      empty: true
    }
  }
}

export default async function BooksPage() {
  // 서버에서 초기 데이터 가져오기
  const initialBooks = await getInitialBooks()

  return (
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
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>책 목록을 불러오는 중...</span>
          </div>
        </div>
      </div>
    }>
      <BooksClient initialBooks={initialBooks} />
    </Suspense>
  )
}