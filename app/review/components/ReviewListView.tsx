"use client"

import { UIReviewItem } from "@/lib/types/review/review"
import { AlertCircle, Calendar, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ReviewListItem } from "../ReviewListItem"

interface ReviewListViewProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => Promise<void>
  onItemSnooze: (itemId: number) => Promise<void>
}

export function ReviewListView({ 
  items, 
  onItemComplete, 
  onItemSnooze 
}: ReviewListViewProps) {
  const [activeTab, setActiveTab] = useState("전체")
  const router = useRouter()

  // 탭별 필터링
  const filteredItems = items.filter((item) => {
    if (activeTab === "오늘") {
      return item.status === "pending"
    } else if (activeTab === "밀린 복습") {
      return item.status === "overdue"
    } else if (activeTab === "완료") {
      return item.status === "completed"
    }
    return true
  })

  const tabs = [
    `전체 (${items.length})`,
    `오늘 (${items.filter((i) => i.status === "pending").length})`,
    `밀린 복습 (${items.filter((i) => i.status === "overdue").length})`,
    `완료 (${items.filter((i) => i.status === "completed").length})`,
  ]

  const stats = [
    { icon: Calendar, label: "오늘 복습", count: items.filter((i) => i.status === "pending").length, color: "bg-blue-100 text-blue-600", onClick: null },
    { icon: AlertCircle, label: "밀린 복습", count: items.filter((i) => i.status === "overdue").length, color: "bg-red-100 text-red-600", onClick: null },
    { icon: CheckCircle, label: "완료된 복습", count: items.filter((i) => i.status === "completed").length, color: "bg-green-100 text-green-600", onClick: () => router.push('/review/history') },
  ]

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick || undefined}
            className={`bg-card border border-border rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3 ${
              stat.onClick ? "cursor-pointer hover:border-primary hover:shadow-md transition-all" : ""
            }`}
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.count}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.split(" ")[0])}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab.split(" ")[0]
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Review Items */}
      <div className="space-y-3 sm:space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              {activeTab === "전체" && "복습할 항목이 없습니다."}
              {activeTab === "오늘" && "오늘 복습할 항목이 없습니다."}
              {activeTab === "밀린 복습" && "밀린 복습 항목이 없습니다."}
              {activeTab === "완료" && "완료된 복습 항목이 없습니다."}
            </p>
            {activeTab === "전체" && items.length === 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                새로운 노트나 인용구를 추가하면 복습 목록에 추가됩니다.
              </p>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <ReviewListItem 
              key={item.id} 
              item={item} 
              onComplete={onItemComplete}
              onSnooze={onItemSnooze}
            />
          ))
        )}
      </div>
    </>
  )
}
