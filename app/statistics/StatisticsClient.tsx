"use client"

import { CategoryDistributionChart } from "@/components/statistics/CategoryDistributionChart"
import { MonthlyReadingChart } from "@/components/statistics/MonthlyReadingChart"
import { StatSummaryCards } from "@/components/statistics/StatSummaryCards"
import { StreakCard } from "@/components/statistics/StreakCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatisticsResponse } from "@/lib/types/statistics/statistics"
import { Hash } from "lucide-react"

interface StatisticsClientProps {
  statisticsData: StatisticsResponse;
}

// 태그 색상 매핑 (태그 이름에 따라 색상 할당)
const getTagColor = (index: number) => {
  const colors = [
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  ];
  return colors[index % colors.length];
}

export default function StatisticsClient({ statisticsData }: StatisticsClientProps) {
  // 연속 독서 일수는 activity.currentStreak 사용
  const streakDays = statisticsData.activity?.currentStreak || 0;
  
  // 태그 데이터 정렬 (사용 횟수 기준 내림차순)
  const sortedTags = [...(statisticsData.tag || [])].sort((a, b) => b.usageCount - a.usageCount);
  
  // 자주 사용하는 태그 (상위 5개)
  const commonTags = sortedTags.slice(0, 5);
  
  // 태그별 통계 (전체)
  const tagStats = sortedTags;
  const maxTagCount = tagStats.length > 0 
    ? Math.max(...tagStats.map(tag => tag.usageCount), 1)
    : 1;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">독서 통계</h1>
          <p className="text-muted-foreground">
            나의 독서 활동을 한눈에 확인해보세요
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <StatSummaryCards summary={statisticsData.summary} />
          </div>
          <div>
            <StreakCard streakDays={streakDays} />
          </div>
          <div>
            <MonthlyReadingChart monthlyData={statisticsData.monthly} />
          </div>
          <div>
            <CategoryDistributionChart categoryData={statisticsData.category} />
          </div>

          {commonTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>자주 사용하는 태그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag, index) => (
                    <Badge
                      key={tag.tagName}
                      variant="secondary"
                      className={`${getTagColor(index)} px-4 py-2 text-sm font-medium`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.tagName}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tagStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>태그별 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tagStats.map((tag, index) => {
                    const percentage = (tag.usageCount / maxTagCount) * 100;
                    return (
                      <div key={tag.tagName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium">#{tag.tagName}</span>
                          </div>
                          <span className="text-sm font-semibold">{tag.usageCount}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

