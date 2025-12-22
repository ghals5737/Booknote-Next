"use client"

import { Card } from "@/components/ui/card"
import { UIReviewItem } from "@/lib/types/review/review"
import { ReviewCardContent } from "./ReviewCardContent"
import { ReviewCardFooter } from "./ReviewCardFooter"
import { ReviewCardHeader } from "./ReviewCardHeader"

interface ReviewCarouselItemProps {
  item: UIReviewItem
  isLoading: boolean
  onComplete: (itemId: number) => void
}

export function ReviewCarouselItem({ item, isLoading, onComplete }: ReviewCarouselItemProps) {
  const handleAssessment = () => {
    // 평가 선택 시 단순 완료 처리 (평가는 저장하지 않음)
    onComplete(item.id)
  }

  return (
    <Card className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      <ReviewCardHeader item={item} />
      <ReviewCardContent item={item} />
      <ReviewCardFooter 
        item={item} 
        isLoading={isLoading} 
        stage="revealed"
        onComplete={onComplete}
        onAssessment={handleAssessment}
      />
    </Card>
  )
}
