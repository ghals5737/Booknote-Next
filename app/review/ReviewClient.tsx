"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { completeReviewItem } from "@/lib/api/review"
import { UIReviewItem } from "@/lib/types/review/review"
import { AlertCircle, BookOpen, Calendar, Check, CheckCircle, ExternalLink, FileText, LayoutGrid, LayoutList, Quote, StickyNote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ReviewListItem } from "./ReviewListItem"

const reviewStats = [
  { icon: Calendar, label: "오늘 복습", count: 0, color: "bg-blue-100 text-blue-600" },
  { icon: AlertCircle, label: "밀린 복습", count: 0, color: "bg-red-100 text-red-600" },
  { icon: CheckCircle, label: "완료된 복습", count: 0, color: "bg-green-100 text-green-600" },
  { icon: StickyNote, label: "전체 노트", count: 0, color: "bg-purple-100 text-purple-600" },
]

interface ReviewClientProps {
  items: UIReviewItem[]
}

function ReviewCarousel({ items, onItemComplete }: { items: UIReviewItem[], onItemComplete: (itemId: number) => Promise<void> }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const handleComplete = useCallback(async () => {
    const currentItem = items[current - 1]
    if (!currentItem || isLoading) return

    setIsLoading(true)
    try {
      await onItemComplete(currentItem.id)
    } finally {
      setIsLoading(false)
    }
  }, [current, items, onItemComplete, isLoading])

  // 오늘 날짜 기준으로 완료된 아이템 개수 계산
  const today = new Date().toISOString().split('T')[0]
  const completedTodayCount = items.filter(item => {
    if (!item.completedTime) return false
    const completedDate = new Date(item.completedTime).toISOString().split('T')[0]
    return completedDate === today
  }).length
  
  const totalCount = items.length
  const progressValue = totalCount > 0 ? (completedTodayCount / totalCount) * 100 : 0

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-semibold">
            {completedTodayCount} / {totalCount}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Review Carousel */}
      <div className="relative">
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4">
                <Card className="h-[400px] md:h-[500px] flex flex-col">
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
                    {/* Type Badge */}
                    <div className="mb-6">
                      {item.type === "NOTE" ? (
                        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                          <FileText className="h-3 w-3" />
                          노트
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                          <Quote className="h-3 w-3" />
                          인용구
                        </Badge>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex items-center justify-center w-full">
                      <p
                        className={`text-center leading-relaxed px-2 ${
                          item.type === "QUOTE"
                            ? "text-xl md:text-2xl lg:text-3xl italic text-foreground"
                            : "text-base md:text-lg lg:text-xl text-foreground"
                        }`}
                      >
                        {item.type === "QUOTE" ? `"${item.content}"` : item.content}
                      </p>
                    </div>
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="flex flex-col gap-3 p-6 pt-0 border-t">
                    <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{item.source}</span>
                        {item.page && (
                          <>
                            <span>·</span>
                            <span>{item.page}p</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{item.date}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 w-full">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full mt-2">
                      {item.bookId && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/book/${item.bookId}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            자세히 보기
                          </Link>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={handleComplete}
                        disabled={isLoading || item.status === "completed"}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {isLoading ? "처리 중..." : item.status === "completed" ? "완료됨" : "완료"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </>
  )
}

function ReviewListView({ 
  items, 
  onItemComplete, 
  onItemPostpone 
}: { 
  items: UIReviewItem[]
  onItemComplete: (itemId: number) => Promise<void>
  onItemPostpone: (itemId: number) => Promise<void>
}) {
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

export default function ReviewClient({ items }: ReviewClientProps) {
  const [mode, setMode] = useState<"carousel" | "list">("carousel")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log('[ReviewClient] items:', items)
  }, [items])

  const handleItemComplete = useCallback(async (itemId: number) => {
    try {
      await completeReviewItem(itemId)
      toast({
        title: "복습 완료",
        description: "복습 항목이 완료 처리되었습니다.",
        variant: "success",
      })
      // 페이지 새로고침하여 최신 데이터 가져오기
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 완료 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast])

  const handleItemPostpone = useCallback(async (itemId: number) => {
    try {
      const { postponeReviewItem } = await import("@/lib/api/review")
      await postponeReviewItem(itemId)
      toast({
        title: "복습 연기",
        description: "복습 항목이 연기 처리되었습니다.",
        variant: "default",
      })
      // 페이지 새로고침하여 최신 데이터 가져오기
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 연기 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast])

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">복습 관리</h1>
            <p className="text-muted-foreground">
              {mode === "carousel"
                ? `총 ${items.length}개의 카드가 기다리고 있어요.`
                : "중요한 노트들을 정기적으로 복습하세요"}
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "carousel" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("carousel")}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              집중 모드
            </Button>
            <Button
              variant={mode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("list")}
              className="flex items-center gap-2"
            >
              <LayoutList className="h-4 w-4" />
              리스트 모드
            </Button>
          </div>
        </div>

        {/* Carousel Mode */}
        {mode === "carousel" && (
          items.length === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">복습할 항목이 없습니다</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  오늘 복습할 노트나 인용구가 없습니다.<br />
                  새로운 노트나 인용구를 추가하면 복습 목록에 추가됩니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ReviewCarousel items={items} onItemComplete={handleItemComplete} />
          )
        )}

        {/* List Mode */}
        {mode === "list" && <ReviewListView items={items} onItemComplete={handleItemComplete} onItemPostpone={handleItemPostpone} />}
      </main>
    </div>
  )
}
