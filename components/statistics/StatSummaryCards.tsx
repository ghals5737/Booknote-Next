"use client"

import { Card, CardContent } from "@/components/ui/card";
import { StatSummary } from "@/lib/types/statistics/statistics";
import { BookCheck, BookMarked, BookOpen, FileText } from "lucide-react";

interface StatSummaryCardsProps {
  summary: StatSummary;
}

export function StatSummaryCards({ summary }: StatSummaryCardsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: "전체 책",
      value: summary.totalBooks,
      unit: "권",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      icon: BookCheck,
      label: "읽은 책",
      value: summary.readBooks,
      unit: "권",
      color: "bg-[#7A9B8E]/10 text-[#7A9B8E] dark:bg-[#7A9B8E]/20 dark:text-[#7A9B8E]",
    },
    {
      icon: BookMarked,
      label: "누적 페이지",
      value: summary.totalPages.toLocaleString(),
      unit: "p",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      icon: FileText,
      label: "작성한 노트",
      value: summary.totalNotes,
      unit: "개",
      color: "bg-[#8B7355]/10 text-[#8B7355] dark:bg-[#8B7355]/20 dark:text-[#8B7355]",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">
                  {stat.value}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    {stat.unit}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

