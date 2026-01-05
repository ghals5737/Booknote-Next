"use client"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { authenticatedApiRequest } from "@/lib/api/nextauth-api"
import { NoteResponse } from "@/lib/types/note/note"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { UIReviewItem } from "@/lib/types/review/review"
import { getLastReviewDate, getLastReviewText } from "@/lib/utils/review-date"
import { Calendar, ChevronDown, ChevronUp, Lock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { ReviewListItem } from "../ReviewListItem"

interface ReviewListViewProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => Promise<void>
  onItemSnooze: (itemId: number) => Promise<void>
  onStartReview?: () => void
  nextReviewDate?: string  // 다음 복습 예정일
}

// 밀린 복습 API 응답 타입
interface OverdueReviewItem {
  id: number
  itemType: "NOTE" | "QUOTE"
  itemId: number
  completed: boolean
  nextReviewDate: string
  postponeCount?: number
  note: NoteResponse | null
  quote: QuoteResponse | null
  bookTitle: string | null
  lastReviewTime?: string | null
  reviewCount?: number
}

// interface OverdueReviewResponse {
//   success: boolean
//   status: number
//   message: string
//   data: OverdueReviewItem[]
//   timestamp: string | null
// }




// 밀린 복습 항목을 UIReviewItem으로 변환
function convertOverdueToUIReviewItem(overdueItem: OverdueReviewItem): UIReviewItem {
  const status: "overdue" = "overdue" as const

  if (overdueItem.itemType === "NOTE" && overdueItem.note) {
    const note = overdueItem.note
    const lastReviewTime = overdueItem.lastReviewTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime, note.startDate)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: overdueItem.id,
      reviewId: overdueItem.id, // overdue API에는 reviewId가 없으므로 id를 사용
      type: "NOTE",
      content: note.content || note.title || "",
      source: overdueItem.bookTitle || "알 수 없음",
      page: undefined,
      date: note.updateDate || note.startDate || new Date().toISOString().split('T')[0],
      tags: note.tagList || [],
      title: note.title,
      dueDate: overdueItem.nextReviewDate,
      frequency: undefined,
      status,
      itemId: overdueItem.itemId,
      bookId: note.bookId > 0 ? note.bookId : undefined,
      completedTime: null,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: overdueItem.reviewCount,
      lastReviewText,
    }
  }
  
  if (overdueItem.itemType === "QUOTE" && overdueItem.quote) {
    const quote = overdueItem.quote
    const lastReviewTime = overdueItem.lastReviewTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: overdueItem.id,
      reviewId: overdueItem.id, // overdue API에는 reviewId가 없으므로 id를 사용
      type: "QUOTE",
      content: quote.content || "",
      source: overdueItem.bookTitle || "알 수 없음",
      page: quote.page,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      title: undefined,
      dueDate: overdueItem.nextReviewDate,
      frequency: undefined,
      status,
      itemId: overdueItem.itemId,
      bookId: quote.bookId,
      completedTime: null,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: overdueItem.reviewCount,
      lastReviewText,
    }
  }

  const lastReviewTime = overdueItem.lastReviewTime || null
  const lastReviewDate = getLastReviewDate(lastReviewTime)
  const lastReviewText = getLastReviewText(lastReviewDate)
  
  return {
    id: overdueItem.id,
    reviewId: overdueItem.id,
    type: overdueItem.itemType,
    content: `${overdueItem.itemType === "NOTE" ? "노트" : "인용구"} #${overdueItem.itemId}`,
    source: "알 수 없음",
    date: new Date().toISOString().split('T')[0],
    tags: [],
    dueDate: overdueItem.nextReviewDate,
    status,
    itemId: overdueItem.itemId,
    completedTime: null,
    lastReviewTime: lastReviewDate?.toISOString() || null,
    reviewCount: overdueItem.reviewCount,
    lastReviewText,
  }
}

// 날짜별로 그룹화하는 함수
function groupOverdueByDate(items: UIReviewItem[]): Array<[string, UIReviewItem[]]> {
  const groups: Record<string, UIReviewItem[]> = {}
  
  items.forEach(item => {
    if (!item.dueDate) return
    
    const date = new Date(item.dueDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(item)
  })

  return Object.entries(groups).sort((a, b) => {
    return a[0].localeCompare(b[0]) // 날짜 오름차순 (오래된 것부터)
  })
}

export function ReviewListView({ 
  items, 
  onItemComplete, 
  onItemSnooze,
  onStartReview,
  nextReviewDate
}: ReviewListViewProps) {
  const isMobile = useIsMobile()
  
  // 밀린 복습 API 호출
  const { data: overdueItemsData, error: overdueError, isLoading: overdueLoading } = useSWR<OverdueReviewItem[]>(
    '/api/v1/reviews/overdue',
    async (url: string) => {
      const response = await authenticatedApiRequest<OverdueReviewItem[]>(url)
      return response.data || []
    }
  )

  // 밀린 복습 항목 변환
  const overdueItems = useMemo(() => {
    if (!overdueItemsData) return []
    return overdueItemsData.map(convertOverdueToUIReviewItem)
  }, [overdueItemsData])

  // 밀린 복습 날짜별 그룹화
  const groupedOverdueItems = useMemo(() => {
    return groupOverdueByDate(overdueItems)
  }, [overdueItems])

  // 날짜별 확장/축소 상태 관리
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // 첫 번째 날짜를 기본적으로 확장
  const isInitialized = useRef(false)
  useEffect(() => {
    if (groupedOverdueItems.length > 0 && !isInitialized.current) {
      setExpandedDates(new Set([groupedOverdueItems[0][0]]))
      isInitialized.current = true
    }
  }, [groupedOverdueItems])

  // 날짜 섹션 토글 함수
  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  // 오늘의 복습: /api/v1/reviews/today API에서 받은 모든 항목 (status 필터링 불필요)
  const todayItems = items

  // 다음 복습 예정일 포맷팅
  const formatNextReviewDate = (dateString?: string): string => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // 날짜 비교 (시간 제외)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      
      if (dateOnly.getTime() === todayOnly.getTime()) {
        return "오늘"
      } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
        return "내일"
      } else {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch {
      return ""
    }
  }

  const formattedNextReviewDate = formatNextReviewDate(nextReviewDate)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 오늘의 복습과 다음 예정 복습 카드 (2컬럼) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 오늘의 복습 카드 */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#2D2D2D]">오늘의 복습</h2>
              {todayItems.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {todayItems.length}개의 복습 항목
                </p>
              )}
            </div>
          </div>

          {todayItems.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-muted-foreground">
                오늘 복습할 항목이 없습니다.
              </p>
            </div>
          ) : (
            <div 
              className="space-y-3 sm:space-y-4 cursor-pointer"
              onClick={onStartReview}
            >
              {todayItems.map((item) => (
                <div key={item.id} onClick={(e) => e.stopPropagation()}>
                  <ReviewListItem 
                    item={item} 
                    onComplete={onItemComplete}
                    onSnooze={onItemSnooze}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 다음 예정 복습 카드 */}
        {nextReviewDate && formattedNextReviewDate && (
          <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#6366F1]/20 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366F1]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#2D2D2D]">다음 예정 복습</h2>
              </div>
            </div>
            <div className="py-4">
              <p className="text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
                {formattedNextReviewDate}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 밀린 복습 섹션 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#2D2D2D]">밀린 복습</h2>
          <span className="text-xs sm:text-sm text-muted-foreground">
            ({overdueLoading ? "..." : overdueItems.length}개)
          </span>
        </div>
        {overdueLoading ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              밀린 복습을 불러오는 중...
            </p>
          </div>
        ) : overdueError ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-destructive">
              밀린 복습을 불러오는데 실패했습니다.
            </p>
          </div>
        ) : overdueItems.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              밀린 복습 항목이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedOverdueItems.map(([date, items]) => {
              const isExpanded = expandedDates.has(date)
              return (
                <div key={date} className="bg-transparent">
                  {/* 날짜 헤더 */}
                  <button
                    onClick={() => toggleDate(date)}
                    className={`w-full flex items-center justify-between gap-2 sm:gap-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-tl-lg rounded-tr-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors mb-0 ${!isExpanded ? 'rounded-bl-lg rounded-br-lg' : ''}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                      <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-[#2D2D2D]`}>
                        {date}
                      </span>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                        {items.length}개 복습
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {/* 복습 항목들 */}
                  {isExpanded && (
                    <div className={`${isMobile ? "space-y-3 pt-3" : "space-y-4 pt-4"}`}>
                      {items.map((item) => (
                        <ReviewListItem 
                          key={item.id} 
                          item={item} 
                          onComplete={onItemComplete}
                          onSnooze={onItemSnooze}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 완료된 복습 링크 */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#2D2D2D] mb-1">완료된 복습</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              지금까지 완료한 복습을 확인해보세요
            </p>
          </div>
          <Link href="/review/history">
            <Button variant="outline" size="lg">
              히스토리 보기
            </Button>
          </Link>
          </div>
      </div>

     
    </div>
  )
}
