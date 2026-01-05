"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { completeReviewItem } from "@/lib/api/review"
import { UIReviewItem } from "@/lib/types/review/review"
import { Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { EmptyState } from "./components/EmptyState"
import { ReviewCarousel } from "./components/ReviewCarousel"
import { ReviewListView } from "./components/ReviewListView"

interface ReviewClientProps {
  items: UIReviewItem[]
  nextReviewDate?: string  // 오늘 이후의 review_item 중 가장 빠른 예정일
}


export default function ReviewClient({ items, nextReviewDate: initialNextReviewDate }: ReviewClientProps) {
  // 오늘의 복습 항목이 있으면 바로 carousel 모드로 시작
  const [mode, setMode] = useState<"carousel" | "list">(items.length > 0 ? "carousel" : "list")
  const router = useRouter()
  const { toast } = useToast()

  // 페이지 진입 시 헤더 아래 내용이 바로 보이도록 천천히 스크롤
  useEffect(() => {
    const headerOffset = 90 // 필요하면 이 값만 조절
    const startY = window.scrollY
    const targetY = headerOffset
    const distance = targetY - startY
    const duration = 800 // ms, 값 키우면 더 천천히 내려감
    const startTime = performance.now()

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      window.scrollTo(0, startY + distance * eased)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [])

  const handleItemComplete = useCallback(async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null, isLastItem?: boolean) => {
    try {
      // 해당 item 찾기
      const item = items.find(i => i.id === itemId)
      if (!item) {
        throw new Error('복습 항목을 찾을 수 없습니다.')
      }

      // assessment를 ReviewResponseType으로 변환
      let responseType: "EASY" | "NORMAL" | "DIFFICULT" | "FORGOT" = "NORMAL"
      if (assessment === "easy") {
        responseType = "EASY"
      } else if (assessment === "hard") {
        responseType = "DIFFICULT"
      } else if (assessment === "forgot") {
        responseType = "FORGOT"
      }
      
      await completeReviewItem(item.reviewId, itemId, responseType)
      
      // API 호출 성공 후, 현재 상태에서 마지막 항목인지 다시 확인
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

  const handleItemSnooze = useCallback(async (itemId: number) => {
    try {
      // 해당 item 찾기
      const item = items.find(i => i.id === itemId)
      if (!item) {
        throw new Error('복습 항목을 찾을 수 없습니다.')
      }

      const { snoozeReviewItem } = await import("@/lib/api/review")
      await snoozeReviewItem(item.reviewId, itemId)
      toast({
        title: "복습 연기",
        description: "복습 항목이 연기 처리되었습니다.",
        variant: "default",
      })
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 연기 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast, items])

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

  const formattedNextReviewDate = formatNextReviewDate(initialNextReviewDate)

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-9 pb-12">
        {/* Carousel Mode */}
        {mode === "carousel" && (
          items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              <ReviewCarousel 
                items={items} 
                onItemComplete={async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null, isLastItem?: boolean) => {
                  await handleItemComplete(itemId, assessment, isLastItem)
                }}
                nextReviewDate={initialNextReviewDate}
              />
              
              {/* 다음 복습일 및 히스토리 링크 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* 다음 예정 복습 카드 */}
                {initialNextReviewDate && formattedNextReviewDate && (
                  <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#6366F1]/20 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366F1]" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl text-[#2D2D2D]">다음 예정 복습</h2>
                      </div>
                    </div>
                    <div className="py-4">
                      <p className="text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
                        {formattedNextReviewDate}
                      </p>
                    </div>
                  </div>
                )}

                {/* 완료된 복습 링크 */}
                <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between h-full">
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
            </div>
          )
        )}

        {/* List Mode */}
        {mode === "list" && (
          <ReviewListView 
            items={items} 
            onItemComplete={async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => {
              await handleItemComplete(itemId, assessment)
            }} 
            onItemSnooze={handleItemSnooze}
            onStartReview={() => setMode("carousel")}
            nextReviewDate={initialNextReviewDate}
          />
        )}
      </main>
    </div>
  )
}
