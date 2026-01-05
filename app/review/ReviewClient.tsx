"use client"

import { useToast } from "@/hooks/use-toast"
import { completeReviewItem } from "@/lib/api/review"
import { UIReviewItem } from "@/lib/types/review/review"
import { Calendar, ChevronLeft, ChevronRight, History, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { ReviewCarousel } from "./components/ReviewCarousel"
import { ReviewHistory } from "./components/ReviewHistory"

interface ReviewClientProps {
  items: UIReviewItem[]
  nextReviewDate?: string
}

export default function ReviewClient({ items, nextReviewDate: initialNextReviewDate }: ReviewClientProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today')
  const [selectedDate, setSelectedDate] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const getDateLabel = () => {
    if (selectedDate === -1) return '어제'
    if (selectedDate === 0) return '오늘'
    return '오늘'
  }

  const handleItemComplete = useCallback(async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null, isLastItem?: boolean) => {
    try {
      const item = items.find(i => i.id === itemId)
      if (!item) {
        throw new Error('복습 항목을 찾을 수 없습니다.')
      }

      let responseType: "EASY" | "NORMAL" | "DIFFICULT" | "FORGOT" = "NORMAL"
      if (assessment === "easy") {
        responseType = "EASY"
      } else if (assessment === "hard") {
        responseType = "DIFFICULT"
      } else if (assessment === "forgot") {
        responseType = "FORGOT"
      }
      
      await completeReviewItem(item.reviewId, itemId, responseType)
      
      const remainingItems = items.filter(item => item.id !== itemId && item.status !== "completed")
      const isActuallyLastItem = remainingItems.length === 0 || isLastItem
      
      if (isActuallyLastItem) {
        toast({
          title: "축하합니다! 🎉",
          description: "오늘의 복습을 모두 완료했습니다!",
          variant: "success",
        })
      } else {
        toast({
          title: "복습 완료",
          description: "복습 항목이 완료 처리되었습니다.",
          variant: "success",
        })
      }
      
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 완료 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast, items])

  const todayReviews = items.filter(r => r.status !== "completed")

  return (
    <div className="min-h-screen bg-background">
      {/* 탭 전환 */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-8 px-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 pb-4 pt-6 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              activeTab === 'today'
                ? 'border-b-2 border-[#8B7355] text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">오늘의 복습</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-4 pt-6 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              activeTab === 'history'
                ? 'border-b-2 border-[#8B7355] text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" />
            <span className="font-medium">복습 기록</span>
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'today' ? (
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* 날짜 네비게이션 */}
          <div className="mb-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setSelectedDate(selectedDate - 1)}
              className="rounded-full p-2 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="이전 날짜"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-6 py-3 backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-[#8B7355]" />
              <span className="font-serif text-xl text-foreground">{getDateLabel()}</span>
            </div>

            <button
              onClick={() => selectedDate < 0 && setSelectedDate(selectedDate + 1)}
              disabled={selectedDate >= 0}
              className={`rounded-full p-2 transition-colors focus:outline-none ${
                selectedDate >= 0
                  ? 'cursor-not-allowed opacity-30'
                  : 'hover:bg-muted/50 focus:ring-2 focus:ring-primary/50'
              }`}
              aria-label="다음 날짜"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* 오늘의 복습 */}
          <section className="mb-16">
            <div className="mb-8 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8B7355]" />
              <h2 className="font-serif text-2xl text-foreground">☆ 과거의 나를 다시 만나는 시간</h2>
            </div>

            {todayReviews.length > 0 ? (
              <ReviewCarousel 
                items={items} 
                onItemComplete={async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null, isLastItem?: boolean) => {
                  await handleItemComplete(itemId, assessment, isLastItem)
                }}
                nextReviewDate={initialNextReviewDate}
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card/30 p-16 text-center backdrop-blur-sm">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B7355]/10">
                    <Sparkles className="h-8 w-8 text-[#8B7355]" />
                  </div>
                </div>
                <p className="mb-2 font-serif text-xl text-foreground">
                  오늘의 복습을 완료했습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  이 순간들은 이제 당신의 기억입니다 ✨
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <ReviewHistory />
      )}
    </div>
  )
}
