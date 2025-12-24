"use client"

import { Button } from "@/components/ui/button"
import { UIReviewItem } from "@/lib/types/review/review"
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ReviewListItem } from "../ReviewListItem"

interface HistoryClientProps {
  items: UIReviewItem[]
}

export default function HistoryClient({ items }: HistoryClientProps) {
  const [filter, setFilter] = useState<"all" | "note" | "quote">("all")

  // 필터링된 항목
  const filteredItems = useMemo(() => {
    if (filter === "all") return items
    return items.filter(item => item.type === filter.toUpperCase())
  }, [items, filter])

  // 날짜별 그룹화
  const groupedByDate = useMemo(() => {
    const groups: Record<string, UIReviewItem[]> = {}
    
    filteredItems.forEach(item => {
      if (!item.completedTime) return
      
      const date = new Date(item.completedTime)
      const dateKey = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    // 날짜순 정렬 (최신순)
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0]?.completedTime || 0)
      const dateB = new Date(b[1][0]?.completedTime || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [filteredItems])

  const stats = {
    total: items.length,
    notes: items.filter(i => i.type === "NOTE").length,
    quotes: items.filter(i => i.type === "QUOTE").length,
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-9 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/review">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#2D2D2D]">복습 히스토리</h1>
              <p className="text-sm text-muted-foreground mt-1">
                완료된 복습을 날짜별로 확인할 수 있습니다
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">전체 완료</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.notes}</div>
                <div className="text-sm text-muted-foreground">노트</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.quotes}</div>
                <div className="text-sm text-muted-foreground">인용구</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              전체 ({stats.total})
            </button>
            <button
              onClick={() => setFilter("note")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "note"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              노트 ({stats.notes})
            </button>
            <button
              onClick={() => setFilter("quote")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "quote"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              인용구 ({stats.quotes})
            </button>
          </div>
        </div>

        {/* Review Items by Date */}
        {groupedByDate.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">완료된 복습이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              복습을 완료하면 여기에 기록됩니다
            </p>
            <Link href="/review">
              <Button>복습하러 가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByDate.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-[#2D2D2D]">{date}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({items.length}개)
                  </span>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <ReviewListItem 
                      key={item.id} 
                      item={item} 
                      onComplete={async () => {}} 
                      onPostpone={async () => {}} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

