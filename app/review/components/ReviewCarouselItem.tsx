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
  return (
    <Card className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      <ReviewCardHeader type={item.type} />
      <ReviewCardContent item={item} />
      <ReviewCardFooter item={item} isLoading={isLoading} onComplete={onComplete} />
    </Card>
  )
}
