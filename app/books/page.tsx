import { fetchBooksServer } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { BooksClient } from './BooksClient'

// 서버사이드에서 초기 데이터 가져오기
async function getInitialBooks() {
  try {
    const books = await fetchBooksServer()
    return books
  } catch (error) {
    console.error('Error fetching initial books:', error)
    return []
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