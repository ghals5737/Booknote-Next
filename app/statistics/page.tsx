"use client"

import { StatSummaryCards } from "@/components/statistics/StatSummaryCards"
import { MonthlyReadingChart } from "@/components/statistics/MonthlyReadingChart"
import { CategoryDistributionChart } from "@/components/statistics/CategoryDistributionChart"
import { ReadingGoalCard } from "@/components/statistics/ReadingGoalCard"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default function StatisticsPage() {
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

        {/* Summary Cards */}
        <div className="mb-6">
          <StatSummaryCards />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Reading Chart - 2 columns */}
          <div className="lg:col-span-2">
            <MonthlyReadingChart />
          </div>
          {/* Reading Goal Card - 1 column */}
          <div className="lg:col-span-1">
            <ReadingGoalCard />
          </div>
        </div>

        {/* Category Distribution Chart - Full width */}
        <div className="mb-6">
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  )
}

