"use client"

import { CategoryDistributionChart } from "@/components/statistics/CategoryDistributionChart"
import { MonthlyReadingChart } from "@/components/statistics/MonthlyReadingChart"
import { ReadingGoalCard } from "@/components/statistics/ReadingGoalCard"
import { StatSummaryCards } from "@/components/statistics/StatSummaryCards"
import { Badge } from "@/components/ui/badge"
import { StatisticsResponse } from "@/lib/types/statistics/statistics"
import { Calendar } from "lucide-react"

interface StatisticsClientProps {
  statisticsData: StatisticsResponse;
}

export default function StatisticsClient({ statisticsData }: StatisticsClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">독서 통계</h1>
            <p className="text-muted-foreground">
              나의 독서 활동을 한눈에 확인해보세요
            </p>
          </div>
          <Badge variant="secondary" className="w-fit flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            지난 30일 기준
          </Badge>
        </div>

        <div className="mb-6">
          <StatSummaryCards summary={statisticsData.summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MonthlyReadingChart monthlyData={statisticsData.monthly} />
          </div>
          <div className="lg:col-span-1">
            <ReadingGoalCard />
          </div>
        </div>
        <div className="mb-6">
          <CategoryDistributionChart categoryData={statisticsData.category} />
        </div>
      </main>
    </div>
  )
}

