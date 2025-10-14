'use client'

import { UnifiedSearch } from "@/components/search/UnifiedSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import {
  AlertCircle,
  Book,
  Bookmark,
  Brain,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";


interface Book {
  id: number
  title: string
  author: string
  progress: number
}

export function DashboardClient() {
  const router = useRouter()
  // const { user } = useNextAuth()
  // const [books] = useState<Book[]>([])

  // 통계 데이터 가져오기 (최근 노트 5개 포함)
  const { stats, error: statsError, mutateStats, isLoading: statsLoading } = useDashboardStats({
    includeRecent: true,
    recentSize: 5
  })

  const isLoading = statsLoading
  const hasError = statsError

  // 백엔드에서 가져온 최근 노트 데이터
  const recentNotes = stats?.recentNotes || []

  //const totalBooks = stats?.books?.total || 0
  const totalNotes = stats?.notes?.total || 0
  const readingBooks = stats?.books?.reading || 0
  const finishedBooks = stats?.books?.finished || 0
  const importantNoteCount = stats?.notes?.important || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">Booknote</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:block">
                  <UnifiedSearch placeholder="노트, 책, 아이디어 검색..." />
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Calendar className="h-4 w-4 mr-2" />
                  검토 일정
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">오늘도 학습을 시작해보세요</h2>
            <p className="text-base sm:text-lg text-muted-foreground">독서에서 얻은 지식을 체계적으로 관리하고 기억에 남게 만드세요.</p>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>데이터를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    console.error('Dashboard error details:', { statsError });
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">Booknote</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:block">
                  <UnifiedSearch placeholder="노트, 책, 아이디어 검색..." />
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Calendar className="h-4 w-4 mr-2" />
                  검토 일정
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">오늘도 학습을 시작해보세요</h2>
            <p className="text-base sm:text-lg text-muted-foreground">독서에서 얻은 지식을 체계적으로 관리하고 기억에 남게 만드세요.</p>
          </div>

          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <span className="text-lg font-medium">데이터를 불러오는 중 오류가 발생했습니다</span>
              <p className="text-sm text-center max-w-md">
                대시보드 데이터를 불러오는 중 문제가 발생했습니다. 
                잠시 후 다시 시도해주세요.
              </p>
              {statsError && (
                <details className="mt-2 text-xs text-left max-w-md">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    오류 상세 정보
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(statsError, null, 2)}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => mutateStats()}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Booknote</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block">
                <UnifiedSearch placeholder="노트, 책, 아이디어 검색..." />
              </div>
              
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Calendar className="h-4 w-4 mr-2" />
                검토 일정
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">오늘도 학습을 시작해보세요</h2>
          <p className="text-base sm:text-lg text-muted-foreground">독서에서 얻은 지식을 체계적으로 관리하고 기억에 남게 만드세요.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">전체 노트</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{totalNotes}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">읽고 있는 책</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{readingBooks}</p>
                </div>
                <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">완독한 책</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{finishedBooks}</p>
                </div>
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">중요 노트</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{importantNoteCount}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>최근 노트</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/notes')}>
                    모두 보기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note) => {
                      // 날짜 포맷팅
                      const formatDate = (dateString: string) => {
                        const date = new Date(dateString);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 1) return '방금 전';
                        if (diffMins < 60) return `${diffMins}분 전`;
                        if (diffHours < 24) return `${diffHours}시간 전`;
                        if (diffDays < 7) return `${diffDays}일 전`;
                        
                        return new Intl.DateTimeFormat('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit' 
                        }).format(date);
                      };

                      return (
                        <div 
                          key={note.id} 
                          className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer group/note"
                          onClick={() => router.push(`/notes/detail/${note.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                              <h3 className="font-medium text-sm sm:text-base text-foreground group-hover/note:text-primary transition-colors truncate">
                                {note.title}
                              </h3>
                              {note.isImportant && (
                                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                                  중요
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-muted-foreground">
                              <span>{formatDate(note.createdAt)}</span>
                              {note.bookTitle && (
                                <span className="truncate">
                                  📖 {note.bookTitle}
                                </span>
                              )}
                            </div>
                          </div>
                          <Bookmark 
                            className={`h-5 w-5 ml-4 group-hover/note:text-primary transition-colors ${
                              note.isImportant ? 'text-primary fill-primary' : 'text-muted-foreground'
                            }`} 
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">아직 작성된 노트가 없습니다</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => router.push('/books')}
                      >
                        첫 번째 노트 작성하기
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            {/* 빠른 작업 및 최근 활동 섹션은 향후 백엔드 API 지원 시 추가 예정 */}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="floating-action"
        onClick={() => router.push('/books')}
      >
        <Book className="h-6 w-6" />
      </button>
    </div>
  );
} 