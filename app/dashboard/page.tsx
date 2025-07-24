import { fetchBooksServer, fetchDashboardStats } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { DashboardClient } from './DashboardClient'

// 서버사이드에서 초기 데이터 가져오기
async function getInitialData() {
  try {
    const [books, stats] = await Promise.all([
      fetchBooksServer(),
      fetchDashboardStats().catch(() => ({
        monthlyStats: [],
        categoryStats: [],
        averageProgress: 0,
        importantNoteCount: 0
      }))
    ])
    
    return { books, stats }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return { 
      books: [], 
      stats: {
        monthlyStats: [],
        categoryStats: [],
        averageProgress: 0,
        importantNoteCount: 0
      }
    }
  }
}

export default async function DashboardPage() {
  // 서버에서 초기 데이터 가져오기
  const initialData = await getInitialData()

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg animate-pulse"></div>
                  <div className="w-32 h-8 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>대시보드를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </div>
    }>
      <DashboardClient initialData={initialData} />
    </Suspense>
  )
}