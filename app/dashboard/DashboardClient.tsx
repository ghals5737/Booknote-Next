'use client'

import { useBook } from "@/components/context/BookContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchDashboardStats, fetchNotes } from "@/lib/api";
import {
    Book,
    Bookmark,
    Brain,
    Calendar,
    FileText,
    Search,
    Target,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";


interface DashboardClientProps {
  initialData: {
    books: Book[]
    stats: {
      monthlyStats: Array<{
        month: string
        readBookCount: number
        noteCount: number
      }>
      categoryStats: Array<{
        category: string
        totalBooks: number
        readBooks: number
      }>
      averageProgress: number
      importantNoteCount: number
    }
  }
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter()
  const { books, mutateBooks } = useBook()
  const [recentNotes, setRecentNotes] = useState<Array<{
    id: number
    title: string
    type: string
    lastModified: string
    tags: string[]
    progress: number
  }>>([])

  // SWR을 사용하여 실시간 데이터 가져오기
  const { data: stats } = useSWR('/api/v1/statistics/dashboard', fetchDashboardStats, {
    fallbackData: initialData.stats,
    revalidateOnFocus: false,
  })

  // 노트 데이터 가져오기
  const { data: notes } = useSWR('/api/v1/notes/users/1', () => fetchNotes(1), {
    revalidateOnFocus: false,
  })

  // 초기 데이터를 SWR 캐시에 설정
  useEffect(() => {
    if (initialData.books.length > 0) {
      mutateBooks(initialData.books, false)
    }
  }, [initialData.books, mutateBooks])

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

  const totalBooks = books.length
  const totalNotes = notes?.length || 0
  const averageProgress = stats?.averageProgress || 0
  const importantNoteCount = stats?.importantNoteCount || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Book className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Booknote</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="노트, 책, 아이디어 검색..."
                  className="w-80 pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                검토 일정
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">오늘도 학습을 시작해보세요</h2>
          <p className="text-lg text-muted-foreground">독서에서 얻은 지식을 체계적으로 관리하고 기억에 남게 만드세요.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 노트</p>
                  <p className="text-2xl font-bold text-foreground">{totalNotes}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">읽은 책</p>
                  <p className="text-2xl font-bold text-foreground">{totalBooks}</p>
                </div>
                <Book className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">평균 진행률</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(averageProgress)}%</p>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">중요 노트</p>
                  <p className="text-2xl font-bold text-foreground">{importantNoteCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Notes */}
          <div className="lg:col-span-2">
            <Card className="knowledge-card">
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
                      <div key={note.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-foreground">{note.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {note.type === 'book' ? '도서' : note.type === 'article' ? '기사' : '노트'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <span>{note.lastModified}</span>
                            <div className="flex space-x-1">
                              {note.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
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
                        <Bookmark className="h-5 w-5 text-muted-foreground ml-4" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>아직 작성된 노트가 없습니다</p>
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
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => router.push('/books')}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    책 추가
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => router.push('/notes')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    노트 관리
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => router.push('/review')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    복습 시작
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Stats */}
            {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
              <Card className="knowledge-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>이번 달 통계</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.monthlyStats.slice(0, 3).map((stat, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{stat.month}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{stat.readBookCount}권</div>
                            <div className="text-xs text-muted-foreground">{stat.noteCount}개 노트</div>
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
      <Button 
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-primary hover:opacity-90 shadow-lg"
        size="icon"
        onClick={() => router.push('/books')}
      >
        <Book className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
} 