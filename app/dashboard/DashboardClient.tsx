'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  const [books] = useState<Book[]>([])
  const [recentNotes, setRecentNotes] = useState<Array<{
    id: number
    title: string
    type: string
    lastModified: string
    tags: string[]
    progress: number
  }>>([])

  // SWR을 사용하여 실시간 데이터 가져오기
  const { data: stats, error: statsError, mutate: mutateStats } = useSWR('/api/v1/statistics/dashboard', () => Promise.resolve({
    monthlyStats: [],
    categoryStats: [],
    averageProgress: 0,
    importantNoteCount: 0
  }), {
    revalidateOnFocus: false,
  })

  // 노트 데이터 가져오기
  const { data: notes, error: notesError, mutate: mutateNotes } = useSWR('/api/v1/notes/users/1', () => Promise.resolve([]), {
    revalidateOnFocus: false,
  })

  const isLoading = !stats && !notes
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

  const totalBooks = books.length
  const totalNotes = notes?.length || 0
  const averageProgress = stats?.averageProgress || 0
  const importantNoteCount = stats?.importantNoteCount || 0

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Book className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Booknote</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="노트, 책, 아이디어 검색..."
                  className="w-80 pl-10"
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
          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">전체 노트</p>
                  <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{totalNotes}</p>
                </div>
                <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">읽은 책</p>
                  <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{totalBooks}</p>
                </div>
                <Book className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">평균 진행률</p>
                  <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{Math.round(averageProgress)}%</p>
                </div>
                <Brain className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="knowledge-card group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">중요 노트</p>
                  <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{importantNoteCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      <div key={note.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer group/note">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-foreground group-hover/note:text-primary transition-colors">{note.title}</h3>
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
                        <Bookmark className="h-5 w-5 text-muted-foreground ml-4 group-hover/note:text-primary transition-colors" />
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

            {/* Monthly Stats */}
            {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
              <Card className="knowledge-card mt-6 group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>이번 달 통계</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.monthlyStats.slice(0, 3).map((stat: { month: string; readBookCount: number; noteCount: number }, index: number) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300">
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
      <button 
        className="floating-action"
        onClick={() => router.push('/books')}
      >
        <Book className="h-6 w-6" />
      </button>
    </div>
  );
} 