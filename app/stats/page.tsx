"use client"

import { useMemo } from "react"
import { BarChart3, BookOpen, FileText, Calendar, TrendingUp, Tag, Clock, QuoteIcon, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useBook } from "@/components/context/BookContext"

export default function StatsView() {
  const { books } = useBook()

  const stats = useMemo(() => {
    const totalBooks = books.length
    const totalNotes = books.reduce((sum, book) => sum + book.notes.length, 0)
    const totalQuotes = books.reduce((sum, book) => sum + book.quotes.length, 0)
    const totalProgress = books.reduce((sum, book) => sum + book.progress, 0)
    const avgProgress = totalBooks > 0 ? Math.round(totalProgress / totalBooks) : 0

    const allNotes = books.flatMap((book) => book.notes.map((note) => ({ ...note, bookTitle: book.title })))
    const allQuotes = books.flatMap((book) => book.quotes.map((quote) => ({ ...quote, bookTitle: book.title })))

    const importantNotes = allNotes.filter((note) => note.isImportant).length
    const importantQuotes = allQuotes.filter((quote) => quote.isImportant).length

    // 완독한 책들
    const finishedBooks = books.filter((book) => book.progress === 100)
    const finishedBooksCount = finishedBooks.length

    // 평균 읽기 기간 계산
    const booksWithDuration = finishedBooks.filter((book) => book.startDate && book.endDate)
    const avgReadingDays =
      booksWithDuration.length > 0
        ? Math.round(
            booksWithDuration.reduce((sum, book) => {
              const duration = Math.ceil((book.endDate!.getTime() - book.startDate!.getTime()) / (1000 * 60 * 60 * 24))
              return sum + duration
            }, 0) / booksWithDuration.length,
          )
        : 0

    // 카테고리별 통계
    const categoryStats = books.reduce(
      (acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // 태그별 통계 (노트 + 문장)
    const tagStats = [...allNotes, ...allQuotes].reduce(
      (acc, item) => {
        item.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    // 월별 활동 (최근 6개월)
    const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      const booksThisMonth = books.filter((book) => {
        const bookDate = new Date(book.createdAt)
        const bookMonthKey = `${bookDate.getFullYear()}-${String(bookDate.getMonth() + 1).padStart(2, "0")}`
        return bookMonthKey === monthKey
      }).length

      const notesThisMonth = allNotes.filter((note) => {
        const noteDate = new Date(note.createdAt)
        const noteMonthKey = `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, "0")}`
        return noteMonthKey === monthKey
      }).length

      const quotesThisMonth = allQuotes.filter((quote) => {
        const quoteDate = new Date(quote.createdAt)
        const quoteMonthKey = `${quoteDate.getFullYear()}-${String(quoteDate.getMonth() + 1).padStart(2, "0")}`
        return quoteMonthKey === monthKey
      }).length

      return {
        month: date.toLocaleDateString("ko-KR", { month: "short" }),
        books: booksThisMonth,
        notes: notesThisMonth,
        quotes: quotesThisMonth,
      }
    }).reverse()

    return {
      totalBooks,
      totalNotes,
      totalQuotes,
      avgProgress,
      importantNotes,
      importantQuotes,
      finishedBooksCount,
      avgReadingDays,
      categoryStats,
      tagStats,
      monthlyActivity,
    }
  }, [books])

  const topCategories = Object.entries(stats.categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const topTags = Object.entries(stats.tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="p-6 space-y-6 bg-content min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">통계</h1>
        <p className="text-cool mt-1">나의 독서 활동을 한눈에 확인해보세요</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-secondary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cool">읽은 책</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalBooks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cool">작성한 노트</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalNotes}</p>
              </div>
              <FileText className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cool">저장한 문장</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalQuotes}</p>
              </div>
              <QuoteIcon className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cool">완독한 책</p>
                <p className="text-2xl font-bold text-foreground">{stats.finishedBooksCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cool">평균 읽기 기간</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgReadingDays > 0 ? `${stats.avgReadingDays}일` : "-"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 활동 */}
        <Card className="border-secondary bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              월별 활동 (최근 6개월)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyActivity.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{month.month}</span>
                    <span className="text-cool">
                      책 {month.books}권, 노트 {month.notes}개, 문장 {month.quotes}개
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-cool">책</span>
                        <span className="text-foreground">{month.books}</span>
                      </div>
                      <Progress value={month.books * 20} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-cool">노트</span>
                        <span className="text-foreground">{month.notes}</span>
                      </div>
                      <Progress value={Math.min(month.notes * 10, 100)} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-cool">문장</span>
                        <span className="text-foreground">{month.quotes}</span>
                      </div>
                      <Progress value={Math.min(month.quotes * 15, 100)} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 카테고리별 통계 */}
        <Card className="border-secondary bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              카테고리별 책 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-cool text-center py-4">아직 책이 없습니다.</p>
              ) : (
                topCategories.map(([category, count]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{category}</span>
                      <span className="text-cool">{count}권</span>
                    </div>
                    <Progress value={(count / stats.totalBooks) * 100} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 중요 항목 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-secondary bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              중요 표시 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="text-2xl font-bold text-foreground">{stats.importantNotes}</div>
                <div className="text-sm text-cool">중요 노트</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="text-2xl font-bold text-foreground">{stats.importantQuotes}</div>
                <div className="text-sm text-cool">중요 문장</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              읽기 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cool">평균 진행률</span>
                <span className="text-foreground font-medium">{stats.avgProgress}%</span>
              </div>
              <Progress value={stats.avgProgress} className="h-2" />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 rounded bg-green-50 border border-green-200">
                  <div className="text-lg font-bold text-green-700">{stats.finishedBooksCount}</div>
                  <div className="text-xs text-green-600">완독</div>
                </div>
                <div className="text-center p-2 rounded bg-blue-50 border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{stats.totalBooks - stats.finishedBooksCount}</div>
                  <div className="text-xs text-blue-600">읽는 중</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 태그 클라우드 */}
      <Card className="border-secondary bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5" />
            자주 사용하는 태그
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topTags.length === 0 ? (
            <p className="text-cool text-center py-4">아직 태그가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-ice text-primary hover:bg-ice/80 cursor-pointer border border-primary/20"
                  style={{
                    fontSize: `${Math.min(0.75 + count * 0.1, 1.2)}rem`,
                    padding: `${Math.min(4 + count, 8)}px ${Math.min(8 + count * 2, 16)}px`,
                  }}
                >
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
