'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useNextAuth } from "@/hooks/use-next-auth";
import {
  AlertCircle,
  Book,
  Bookmark,
  Brain,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Target,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";


interface Book {
  id: number
  title: string
  author: string
  progress: number
}

export function DashboardClient() {
  const router = useRouter()
  const { user } = useNextAuth()
  const [books] = useState<Book[]>([])
  const [recentNotes, setRecentNotes] = useState<Array<{
    id: number
    title: string
    type: string
    lastModified: string
    tags: string[]
    progress: number
  }>>([])

  // 통계 데이터 가져오기
  const { stats, error: statsError, mutateStats, isLoading: statsLoading } = useDashboardStats()

  // 노트 데이터 가져오기 - auth에서 사용자 ID 가져오기
  const notesKey = user?.id ? `/api/v1/notes/users/${user.id}` : null
  const { data: notes, error: notesError, mutate: mutateNotes } = useSWR(notesKey, () => Promise.resolve([]), {
    revalidateOnFocus: false,
  })

  const isLoading = statsLoading
  const hasError = statsError || notesError

  // 최근 노트 설정
  useEffect(() => {
    if (notes && notes.length > 0) {
      setRecentNotes(notes.slice(0, 3).map((note: {
        id: number
        title: string
        tagList?: string[]
      }) => ({
        id: note.id,
        title: note.title,
        type: "note",
        lastModified: "방금 전",
        tags: note.tagList || [],
        progress: 100
      })))
    }
  }, [notes])

  const totalBooks = stats?.books?.total || 0
  const totalNotes = stats?.notes?.total || 0
  const readingBooks = stats?.books?.reading || 0
  const finishedBooks = stats?.books?.finished || 0
  const importantNoteCount = stats?.notes?.important || 0
  const thisMonthNotes = stats?.notes?.thisMonth || 0

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
            <p className="text-cool mt-1">데이터를 불러오는 중...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-cool">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>데이터를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">대시보드</h1>
            <p className="text-cool mt-1">오류가 발생했습니다</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-cool">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <span>데이터를 불러오는 중 오류가 발생했습니다</span>
            <Button 
              onClick={() => {
                mutateStats();
                mutateNotes();
              }}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
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
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="노트, 책, 아이디어 검색..."
                  className="w-64 sm:w-80 pl-10"
                />
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
                    recentNotes.map((note) => (
                      <div key={note.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer group/note">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <h3 className="font-medium text-sm sm:text-base text-foreground group-hover/note:text-primary transition-colors truncate">{note.title}</h3>
                            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                              {note.type === 'book' ? '도서' : note.type === 'article' ? '기사' : '노트'}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-muted-foreground">
                            <span>{note.lastModified}</span>
                            <div className="flex space-x-1">
                              {note.tags.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {note.progress < 100 && (
                            <div className="mt-2">
                              <Progress value={note.progress} className="h-2" />
                              <span className="text-xs text-muted-foreground mt-1 block">
                                진행률: {note.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                        <Bookmark className="h-5 w-5 text-muted-foreground ml-4 group-hover/note:text-primary transition-colors" />
                      </div>
                    ))
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
            <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300" 
                    variant="ghost"
                    onClick={() => router.push('/books')}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    책 추가
                  </Button>
                  <Button 
                    className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300" 
                    variant="ghost"
                    onClick={() => router.push('/notes')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    노트 관리
                  </Button>
                  <Button 
                    className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-300" 
                    variant="ghost"
                    onClick={() => router.push('/review')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    복습 시작
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {stats?.recentActivity && stats.recentActivity.length > 0 && (
              <Card className="knowledge-card mt-6 group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>최근 활동</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 3).map((activity: { type: string; bookTitle: string; timestamp: string }, index: number) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {activity.type === 'note_created' && '노트 작성'}
                              {activity.type === 'book_added' && '책 추가'}
                              {activity.type === 'quote_added' && '인용구 추가'}
                              {activity.type === 'book_finished' && '책 완독'}
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.bookTitle}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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