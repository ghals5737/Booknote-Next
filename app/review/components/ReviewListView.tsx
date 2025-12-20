"use client"

import { UIReviewItem } from "@/lib/types/review/review"
import { AlertCircle, Calendar, CheckCircle, StickyNote } from "lucide-react"
import { useState } from "react"
import { ReviewListItem } from "../ReviewListItem"

interface ReviewListViewProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number) => Promise<void>
  onItemPostpone: (itemId: number) => Promise<void>
}

export function ReviewListView({ 
  items, 
  onItemComplete, 
  onItemPostpone 
}: ReviewListViewProps) {
  const [activeTab, setActiveTab] = useState("전체")

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
    { icon: Calendar, label: "오늘 복습", count: items.filter((i) => i.status === "pending").length, color: "bg-blue-100 text-blue-600" },
    { icon: AlertCircle, label: "밀린 복습", count: items.filter((i) => i.status === "overdue").length, color: "bg-red-100 text-red-600" },
    { icon: CheckCircle, label: "완료된 복습", count: items.filter((i) => i.status === "completed").length, color: "bg-green-100 text-green-600" },
    { icon: StickyNote, label: "전체 노트", count: items.length, color: "bg-purple-100 text-purple-600" },
  ]

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3"
          >
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.split(" ")[0])}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <ReviewListItem 
            key={item.id} 
            item={item} 
            onComplete={onItemComplete}
            onPostpone={onItemPostpone}
          />
        ))}
      </div>
    </>
  )
}
