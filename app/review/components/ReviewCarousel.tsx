"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { UIReviewItem } from "@/lib/types/review/review"
import { useCallback, useEffect, useState } from "react"
import { useCarouselKeyboard } from "../hooks/useCarouselKeyboard"
import { useReviewProgress } from "../hooks/useReviewProgress"
import { ReviewCarouselItem } from "./ReviewCarouselItem"
import { ReviewCompleteCard } from "./ReviewCompleteCard"
import { ReviewProgressBar } from "./ReviewProgressBar"
import { ReviewStartCard } from "./ReviewStartCard"

interface ReviewCarouselProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null, isLastItem?: boolean) => Promise<void>
  nextReviewDate?: string  // 다음 복습 예정일
}

export function ReviewCarousel({ items, onItemComplete, nextReviewDate }: ReviewCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [isLoading, setIsLoading] = useState(false)
  const [hasCompletedAll, setHasCompletedAll] = useState(false)
  const { completedCount, totalCount } = useReviewProgress(items)

  useCarouselKeyboard(api)

  // 모든 항목이 완료되었는지 확인하고 완료 카드 표시
  useEffect(() => {
    if (completedCount === totalCount && totalCount > 0) {
      setHasCompletedAll(true)
      // 완료 카드로 자동 이동
      if (api) {
        setTimeout(() => {
          const totalSlides = items.length + 2 // 시작 카드 + 복습 카드들 + 완료 카드
          api.scrollTo(totalSlides - 1)
        }, 300)
      }
    }
  }, [completedCount, totalCount, api, items.length])

  const handleStart = useCallback(() => {
    // 첫 번째 복습 카드로 이동 (인덱스 1, 시작 카드가 0번)
    api?.scrollTo(1)
  }, [api])

  const handleComplete = useCallback(async (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      // 현재 완료되지 않은 항목 수 확인 (완료 전 상태 기준)
      const remainingItems = items.filter(item => item.id !== itemId && item.status !== "completed")
      const isLastItem = remainingItems.length === 0
      
      await onItemComplete(itemId, assessment, isLastItem)
      
      // 마지막 항목 완료 시 완료 카드 표시 및 자동 이동
      if (isLastItem) {
        setHasCompletedAll(true)

        if (api) {
          // 약간의 지연 후 완료 카드로 이동 (애니메이션 및 상태 업데이트 대기)
          setTimeout(() => {
            const totalSlides = items.length + 2 // 시작 카드 + 복습 카드들 + 완료 카드
            api.scrollTo(totalSlides - 1)
          }, 300)
        }
      } else {
        // 마지막 항목이 아니어도 모든 항목이 완료되었는지 확인
        const allCompleted = items.every(item => item.id === itemId || item.status === "completed")
        if (allCompleted) {
          setHasCompletedAll(true)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [onItemComplete, isLoading, items, api])

  // 모든 항목이 완료되었는지 확인
  const allCompletedFromData = completedCount === totalCount && totalCount > 0
  const showCompleteCard = hasCompletedAll || allCompletedFromData

  return (
    <>
      <ReviewProgressBar completedCount={completedCount} totalCount={totalCount} />

      <div className="relative mt-4">
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* 시작 카드 */}
            <CarouselItem className="pl-2 md:pl-4">
              <ReviewStartCard
                onStart={handleStart}
                totalCount={totalCount}
                isAllCompleted={showCompleteCard}
              />
            </CarouselItem>
            
            {/* 복습 카드들 */}
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4">
                <ReviewCarouselItem
                  item={item}
                  isLoading={isLoading}
                  onComplete={handleComplete}
                />
              </CarouselItem>
            ))}

            {/* 완료 카드 - 모든 항목이 완료되었을 때 또는 로컬 상태에서 완료로 판단될 때 표시 */}
            {showCompleteCard && (
              <CarouselItem className="pl-2 md:pl-4">
                <ReviewCompleteCard totalCount={totalCount} nextReviewDate={nextReviewDate} />
              </CarouselItem>
            )}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </>
  )
}
