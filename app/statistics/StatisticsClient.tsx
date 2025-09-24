'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useNextAuth } from "@/hooks/use-next-auth";
import {
    BarChart3,
    Book,
    Clock,
    FileText,
    Loader2,
    PieChart as PieChartIcon,
    Quote,
    Star,
    Target,
    TrendingUp
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

export function StatisticsClient() {
  const { user, isAuthenticated } = useNextAuth();

  // 통계 데이터 가져오기
  const { stats, error: statsError, isLoading: statsLoading, mutateStats } = useDashboardStats();

  // 실제 통계 데이터 또는 기본값
  const overallStats = {
    totalBooks: stats?.books?.total || 0,
    completedBooks: stats?.books?.finished || 0,
    currentlyReading: stats?.books?.reading || 0,
    totalNotes: stats?.notes?.total || 0,
    totalQuotes: stats?.quotes?.total || 0,
    importantNotes: stats?.notes?.important || 0,
    importantQuotes: stats?.quotes?.important || 0,
    thisMonthNotes: stats?.notes?.thisMonth || 0,
    averageRating: 4.2, // 임시값
    readingStreak: 15, // 임시값
    pagesRead: 3247 // 임시값
  };

  const monthlyReadingData = [
    { month: '1월', books: 2, pages: 450 },
    { month: '2월', books: 3, pages: 520 },
    { month: '3월', books: 1, pages: 280 },
    { month: '4월', books: 4, pages: 680 },
    { month: '5월', books: 2, pages: 390 },
    { month: '6월', books: 3, pages: 510 },
    { month: '7월', books: 3, pages: 600 }
  ];

  const categoryData = [
    { name: '자기계발', value: 8, color: '#8B5CF6' },
    { name: '소설', value: 6, color: '#06B6D4' },
    { name: '기술', value: 4, color: '#10B981' },
    { name: '비즈니스', value: 3, color: '#F59E0B' },
    { name: '역사', value: 2, color: '#EF4444' },
    { name: '기타', value: 1, color: '#6B7280' }
  ];

  const readingProgressData = [
    { week: '1주', progress: 20 },
    { week: '2주', progress: 45 },
    { week: '3주', progress: 60 },
    { week: '4주', progress: 85 },
    { week: '5주', progress: 100 },
    { week: '6주', progress: 30 },
    { week: '7주', progress: 70 }
  ];

  const topBooks = [
    { title: "원자 습관", author: "제임스 클리어", rating: 5, notes: 23, quotes: 12 },
    { title: "클린 코드", author: "로버트 마틴", rating: 4.8, notes: 18, quotes: 8 },
    { title: "사피엔스", author: "유발 하라리", rating: 4.5, notes: 15, quotes: 15 },
    { title: "미드나잇 라이브러리", author: "매트 헤이그", rating: 4.2, notes: 12, quotes: 10 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'books' ? '읽은 책' : entry.dataKey === 'pages' ? '페이지' : entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">독서 통계</h1>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>통계 데이터를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">독서 통계</h1>
          <p className="text-muted-foreground">오류가 발생했습니다</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <span>통계 데이터를 불러오는 중 오류가 발생했습니다</span>
            <Button 
              onClick={() => mutateStats()}
              variant="outline"
              className="mt-4"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">독서 통계</h1>
        <p className="text-muted-foreground">당신의 독서 여정을 한눈에 확인하세요</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">읽고 있는 책</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.currentlyReading}</p>
              </div>
              <Book className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">중요 노트</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.importantNotes}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">이번 달 노트</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.thisMonthNotes}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">중요 인용구</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.importantQuotes}</p>
              </div>
              <Quote className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 도서</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.totalBooks}</p>
              </div>
              <Book className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">완독률</p>
                <p className="text-2xl font-bold text-foreground">
                  {overallStats.totalBooks > 0 ? Math.round((overallStats.completedBooks / overallStats.totalBooks) * 100) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">작성 노트</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.totalNotes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">수집 문장</p>
                <p className="text-2xl font-bold text-foreground">{overallStats.totalQuotes}</p>
              </div>
              <Quote className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Reading Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              월별 독서량
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyReadingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="books"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              장르별 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              주간 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={readingProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="progress" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reading Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              독서 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">완독한 책</span>
              <span className="font-semibold">{overallStats.completedBooks}권</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">읽고 있는 책</span>
              <span className="font-semibold">{overallStats.currentlyReading}권</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">평균 평점</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{overallStats.averageRating}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">연속 독서일</span>
              <Badge variant="secondary">{overallStats.readingStreak}일</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">총 읽은 페이지</span>
              <span className="font-semibold">{overallStats.pagesRead.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Books */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              베스트 도서
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBooks.map((book, index) => (
                <div key={index} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{book.rating}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>노트 {book.notes}</span>
                    <span>문장 {book.quotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
