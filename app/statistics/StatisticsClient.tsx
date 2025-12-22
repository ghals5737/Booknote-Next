"use client"

import { ActivityTab } from "@/components/statistics/ActivityTab"
import { CategoryDistributionChart } from "@/components/statistics/CategoryDistributionChart"
import { MonthlyReadingChart } from "@/components/statistics/MonthlyReadingChart"
import { StatSummaryCards } from "@/components/statistics/StatSummaryCards"
import { StreakCard } from "@/components/statistics/StreakCard"
import { TagsTab } from "@/components/statistics/TagsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatisticsResponse } from "@/lib/types/statistics/statistics"

interface StatisticsClientProps {
  statisticsData: StatisticsResponse;
}

export default function StatisticsClient({ statisticsData }: StatisticsClientProps) {
  // 연속 독서 일수 계산 (실제로는 API에서 가져와야 함)
  // 임시로 15일로 설정
  const streakDays = 15;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">독서 통계</h1>
          <p className="text-muted-foreground">
            나의 독서 활동을 한눈에 확인해보세요
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="activity">활동</TabsTrigger>
            <TabsTrigger value="tags">태그</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 통계 카드들 */}
            <div>
              <StatSummaryCards summary={statisticsData.summary} />
            </div>

            {/* 연속 독서 기록 */}
            <div>
              <StreakCard streakDays={streakDays} />
            </div>

            {/* 월별 활동 차트 */}
            <div>
              <MonthlyReadingChart monthlyData={statisticsData.monthly} />
            </div>

            {/* 카테고리별 분포 */}
            <div>
              <CategoryDistributionChart categoryData={statisticsData.category} />
            </div>
          </TabsContent>

          {/* 활동 탭 */}
          <TabsContent value="activity">
            <ActivityTab monthlyData={statisticsData.monthly} />
          </TabsContent>

          {/* 태그 탭 */}
          <TabsContent value="tags">
            <TagsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

