"use client"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { authenticatedApiRequest } from "@/lib/api/nextauth-api"
import { Review, ReviewItem, UIReviewItem } from "@/lib/types/review/review"
import { PageResponse } from "@/lib/types/pagenation/pagenation"
import { getLastReviewDate, getLastReviewText } from "@/lib/utils/review-date"
import { ArrowLeft, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import useSWRInfinite from "swr/infinite"
import { ReviewListItem } from "../ReviewListItem"

// 히스토리 API 응답 타입
interface ReviewHistoryItem {
  id: number
  reviewId: number
  itemType: "NOTE" | "QUOTE"
  itemId: number
  completed: boolean
  completedTime: string | null
  note: any | null
  quote: any | null
  bookTitle: string | null
  lastReviewTime?: string | null
  reviewCount?: number
}

interface ReviewHistory {
  id: number
  completed: boolean
  plannedTime: string
  completedTime: string | null
  reviewItems: ReviewHistoryItem[]
}

interface ReviewHistoryResponse {
  success: boolean
  status: number
  message: string
  data: PageResponse<ReviewHistory>
  timestamp: string | null
}

// 데이터 변환 함수
function convertHistoryToReview(history: ReviewHistory[]): Review[] {
  return history.map(review => ({
    id: review.id,
    plannedTime: review.plannedTime,
    completedTime: review.completedTime,
    items: review.reviewItems.map(item => ({
      id: item.id,
      reviewId: item.reviewId,
      itemType: item.itemType,
      itemId: item.itemId,
      completed: item.completed,
      completedTime: item.completedTime,
      note: item.note,
      quote: item.quote,
      bookTitle: item.bookTitle,
      lastReviewTime: item.lastReviewTime,
      reviewCount: item.reviewCount,
    }))
  }))
}

function convertToUIReviewItem(
  reviewItem: ReviewItem,
  review: Review
): UIReviewItem {
  const status: "completed" = "completed"
  
  if (reviewItem.itemType === "NOTE" && reviewItem.note) {
    const note = reviewItem.note
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime, note.startDate)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
      type: "NOTE",
      content: note.content || note.title || "",
      source: reviewItem.bookTitle || "알 수 없음",
      page: undefined,
      date: note.updateDate || note.startDate || new Date().toISOString().split('T')[0],
      tags: note.tagList || [],
      title: note.title,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: note.bookId > 0 ? note.bookId : undefined,
      completedTime: reviewItem.completedTime,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: reviewItem.reviewCount,
      lastReviewText,
    }
  }
  
  if (reviewItem.itemType === "QUOTE" && reviewItem.quote) {
    const quote = reviewItem.quote
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
      type: "QUOTE",
      content: quote.content || "",
      source: reviewItem.bookTitle || "알 수 없음",
      page: quote.page,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      title: undefined,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: quote.bookId,
      completedTime: reviewItem.completedTime,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: reviewItem.reviewCount,
      lastReviewText,
    }
  }

  const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
  const lastReviewDate = getLastReviewDate(lastReviewTime)
  const lastReviewText = getLastReviewText(lastReviewDate)
  
  return {
    id: reviewItem.id,
    type: reviewItem.itemType,
    content: `${reviewItem.itemType === "NOTE" ? "노트" : "인용구"} #${reviewItem.itemId}`,
    source: "알 수 없음",
    date: new Date().toISOString().split('T')[0],
    tags: [],
    dueDate: review.plannedTime,
    status,
    itemId: reviewItem.itemId,
    completedTime: reviewItem.completedTime,
    lastReviewTime: lastReviewDate?.toISOString() || null,
    reviewCount: reviewItem.reviewCount,
    lastReviewText,
  }
}

// 날짜별 그룹화
function groupByDate(items: UIReviewItem[]): Array<[string, UIReviewItem[]]> {
  const groups: Record<string, UIReviewItem[]> = {}
  
  items.forEach(item => {
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

  return Object.entries(groups).sort((a, b) => {
    const dateA = new Date(a[1][0]?.completedTime || 0)
    const dateB = new Date(b[1][0]?.completedTime || 0)
    return dateB.getTime() - dateA.getTime()
  })
}

export default function HistoryClient() {
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<"all" | "note" | "quote">("all")
  const [page, setPage] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const PAGE_SIZE = 20

  // PC: 페이지네이션용 SWR
  const { data: pcData, error: pcError, isLoading: pcLoading } = useSWR<ReviewHistoryResponse>(
    !isMobile ? `/api/v1/reviews/history?page=${page}&size=${PAGE_SIZE}` : null,
    async (url: string) => {
      const response = await authenticatedApiRequest<PageResponse<ReviewHistory>>(url)
      return {
        ...response,
        data: response.data
      } as ReviewHistoryResponse
    }
  )

  // 모바일: 무한 스크롤용 SWRInfinite
  const getKey = (pageIndex: number, previousPageData: ReviewHistoryResponse | null) => {
    if (previousPageData && previousPageData.data && (previousPageData.data.last || previousPageData.data.empty)) return null
    return `/api/v1/reviews/history?page=${pageIndex}&size=${PAGE_SIZE}`
  }

  const { data: mobileData, error: mobileError, isLoading: mobileLoading, size, setSize, isValidating } = useSWRInfinite<ReviewHistoryResponse>(
    isMobile ? getKey : () => null,
    async (url: string) => {
      const response = await authenticatedApiRequest<PageResponse<ReviewHistory>>(url)
      return {
        ...response,
        data: response.data
      } as ReviewHistoryResponse
    }
  )

  // 데이터 변환
  const allItems = useMemo(() => {
    if (isMobile) {
      if (!mobileData) return []
      const allReviews: Review[] = []
      mobileData.forEach(pageData => {
        if (pageData?.data?.content) {
          allReviews.push(...convertHistoryToReview(pageData.data.content))
        }
      })
      
      const uiItems: UIReviewItem[] = []
      allReviews.forEach(review => {
        review.items.forEach(item => {
          uiItems.push(convertToUIReviewItem(item, review))
        })
      })
      
      return uiItems.sort((a, b) => {
        const timeA = a.completedTime ? new Date(a.completedTime).getTime() : 0
        const timeB = b.completedTime ? new Date(b.completedTime).getTime() : 0
        return timeB - timeA
      })
    } else {
      if (!pcData?.data?.content) return []
      const reviews = convertHistoryToReview(pcData.data.content)
      const uiItems: UIReviewItem[] = []
      reviews.forEach(review => {
        review.items.forEach(item => {
          uiItems.push(convertToUIReviewItem(item, review))
        })
      })
      return uiItems.sort((a, b) => {
        const timeA = a.completedTime ? new Date(a.completedTime).getTime() : 0
        const timeB = b.completedTime ? new Date(b.completedTime).getTime() : 0
        return timeB - timeA
      })
    }
  }, [isMobile, mobileData, pcData])

  // 필터링
  const filteredItems = useMemo(() => {
    if (filter === "all") return allItems
    return allItems.filter(item => item.type === filter.toUpperCase())
  }, [allItems, filter])

  // 날짜별 그룹화
  const groupedByDate = useMemo(() => groupByDate(filteredItems), [filteredItems])

  // 무한 스크롤: Intersection Observer
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          const lastPage = mobileData?.[mobileData.length - 1]
          if (lastPage?.data && !lastPage.data.last && !lastPage.data.empty) {
            setSize(size + 1)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [isMobile, mobileData, isValidating, size, setSize])

  const stats = {
    total: allItems.length,
    notes: allItems.filter(i => i.type === "NOTE").length,
    quotes: allItems.filter(i => i.type === "QUOTE").length,
  }

  const isLoading = isMobile ? mobileLoading : pcLoading
  const error = isMobile ? mobileError : pcError
  const hasMore = isMobile && mobileData && mobileData[mobileData.length - 1]?.data && !mobileData[mobileData.length - 1].data.last
  const totalPages = pcData?.data?.totalPages || 0
  const currentPage = page + 1

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

        {/* Loading State */}
        {isLoading && groupedByDate.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-destructive">데이터를 불러오는데 실패했습니다.</p>
          </div>
        )}

        {/* Review Items by Date */}
        {!isLoading && !error && groupedByDate.length === 0 && (
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
        )}

        {!isLoading && !error && groupedByDate.length > 0 && (
          <>
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

            {/* 모바일: 무한 스크롤 로더 */}
            {isMobile && (
              <div ref={loadMoreRef} className="py-8 text-center">
                {isValidating && (
                  <p className="text-muted-foreground">더 불러오는 중...</p>
                )}
                {!hasMore && mobileData && mobileData.length > 0 && (
                  <p className="text-muted-foreground">모든 데이터를 불러왔습니다</p>
                )}
              </div>
            )}

            {/* PC: 페이지네이션 */}
            {!isMobile && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i
                    } else if (currentPage <= 3) {
                      pageNum = i
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 5 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum + 1}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
