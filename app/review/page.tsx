"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Check, CheckCircle, Clock, Eye, StickyNote, X } from "lucide-react"
import { useState } from "react"

const reviewStats = [
  { icon: Calendar, label: "오늘 복습", count: 0, color: "bg-blue-100 text-blue-600" },
  { icon: AlertCircle, label: "밀린 복습", count: 5, color: "bg-red-100 text-red-600" },
  { icon: CheckCircle, label: "완료된 복습", count: 1, color: "bg-green-100 text-green-600" },
  { icon: StickyNote, label: "전체 노트", count: 6, color: "bg-purple-100 text-purple-600" },
]

const reviewItems = [
  {
    id: 1,
    title: "성장 마인드셋의 중요성",
    book: "마인드셋",
    tags: [
      { name: "성장", color: "bg-yellow-100 text-yellow-700" },
      { name: "지연", color: "bg-red-100 text-red-700" },
    ],
    dueDate: "2024-01-15",
    frequency: "3번째 복습",
    status: "overdue",
  },
  {
    id: 2,
    title: "습관 형성의 4단계",
    book: "아토믹 해빗",
    tags: [
      { name: "위습", color: "bg-green-100 text-green-700" },
      { name: "지연", color: "bg-red-100 text-red-700" },
    ],
    dueDate: "2024-01-15",
    frequency: "1번째 복습",
    status: "overdue",
  },
  {
    id: 3,
    title: "몰입의 조건들",
    book: "플로우",
    tags: [
      { name: "아하순간", color: "bg-pink-100 text-pink-700" },
      { name: "지연", color: "bg-red-100 text-red-700" },
    ],
    dueDate: "2024-01-14",
    frequency: "5번째 복습",
    status: "overdue",
  },
]

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState("전체")
  const tabs = ["전체 (6)", "오늘 (0)", "밀린 복습 (5)", "완료 (1)"]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">복습 관리</h1>
          <p className="text-muted-foreground">중요한 노트들을 정기적으로 복습하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reviewStats.map((stat, index) => (
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
          {reviewItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.tags.map((tag, index) => (
                      <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${tag.color}`}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.book}</div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>다음 복습: {item.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.frequency}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600">
                    <X className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-yellow-600">
                    <Clock className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-600">
                    <Check className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
