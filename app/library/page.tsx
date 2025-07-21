import { fetchBooks } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { LibraryClient } from './LibraryClient'

// 서버 컴포넌트에서 초기 데이터 가져오기
async function getInitialBooks() {
  try {
    // 서버 사이드에서 API 호출
    const books = await fetchBooks()
    return books
  } catch (error) {
    console.error('Error fetching initial books:', error)
    return []
  }
}

export default async function LibraryPage() {
  // 서버에서 초기 데이터 가져오기
  const initialBooks = await getInitialBooks()

  return (
    <Suspense fallback={
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">내 서재</h1>
            <p className="text-cool mt-1">책 목록을 불러오는 중...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-cool">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>책 목록을 불러오는 중...</span>
          </div>
        </div>
      </div>
    }>
      <LibraryClient initialBooks={initialBooks} />
    </Suspense>
  )
}
