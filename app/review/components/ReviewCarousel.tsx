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
import { useCallback, useState } from "react"
import { useCarouselKeyboard } from "../hooks/useCarouselKeyboard"
import { useReviewProgress } from "../hooks/useReviewProgress"
import { ReviewCarouselItem } from "./ReviewCarouselItem"
import { ReviewProgressBar } from "./ReviewProgressBar"
import { ReviewStartCard } from "./ReviewStartCard"

interface ReviewCarouselProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number, isLastItem?: boolean) => Promise<void>
}

export function ReviewCarousel({ items, onItemComplete }: ReviewCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [isLoading, setIsLoading] = useState(false)
  const { completedCount, totalCount } = useReviewProgress(items)

  useCarouselKeyboard(api)

  const handleStart = useCallback(() => {
    // 첫 번째 복습 카드로 이동 (인덱스 1, 시작 카드가 0번)
    api?.scrollTo(1)
  }, [api])

  const handleComplete = useCallback(async (itemId: number) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      // 현재 완료되지 않은 항목 수 확인 (완료 전 상태 기준)
      const remainingItems = items.filter(item => item.id !== itemId && item.status !== "completed")
      const isLastItem = remainingItems.length === 0
      
      await onItemComplete(itemId, isLastItem)
    } finally {
      setIsLoading(false)
    }
  }, [onItemComplete, isLoading, items])

  return (
    <>
      <ReviewProgressBar completedCount={completedCount} totalCount={totalCount} />

      <div className="relative">
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* 시작 카드 */}
            <CarouselItem className="pl-2 md:pl-4">
              <ReviewStartCard onStart={handleStart} totalCount={totalCount} />
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
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </>
  )
}
