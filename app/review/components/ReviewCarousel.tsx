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

interface ReviewCarouselProps {
  items: UIReviewItem[]
  onItemComplete: (itemId: number) => Promise<void>
}

export function ReviewCarousel({ items, onItemComplete }: ReviewCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [isLoading, setIsLoading] = useState(false)
  const { completedCount, totalCount } = useReviewProgress(items)

  useCarouselKeyboard(api)

  const handleComplete = useCallback(async (itemId: number) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await onItemComplete(itemId)
    } finally {
      setIsLoading(false)
    }
  }, [onItemComplete, isLoading])

  return (
    <>
      <ReviewProgressBar completedCount={completedCount} totalCount={totalCount} />

      <div className="relative">
        <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent className="-ml-2 md:-ml-4">
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
