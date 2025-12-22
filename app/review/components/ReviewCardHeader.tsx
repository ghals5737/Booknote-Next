import { Badge } from "@/components/ui/badge"
import { UIReviewItem } from "@/lib/types/review/review"
import { getPlannedReviewText, getReviewCountText } from "@/lib/utils/review-date"
import { Calendar, FileText, Quote } from "lucide-react"

interface ReviewCardHeaderProps {
  item: UIReviewItem
}

export function ReviewCardHeader({ item }: ReviewCardHeaderProps) {
  const reviewCountText = getReviewCountText(item.reviewCount)
  const plannedText = item.dueDate ? getPlannedReviewText(item.dueDate) : null

  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-2 space-y-2 border-b">
      {/* 타입 배지와 메타 정보 */}
      <div className="flex items-center justify-between gap-2">
        {item.type === "NOTE" ? (
          <Badge variant="secondary" className="flex items-center gap-1.5 w-fit text-xs">
            <FileText className="h-3 w-3" />
            노트
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1.5 w-fit text-xs">
            <Quote className="h-3 w-3" />
            인용구
          </Badge>
        )}
        
        {/* 복습 횟수 */}
        {reviewCountText && (
          <span className="text-xs text-muted-foreground">{reviewCountText}</span>
        )}
      </div>

      {/* 컨텍스트 정보 */}
      <div className="space-y-1">
        {/* 마지막 복습 정보 */}
        {item.lastReviewText && (
          <div className="text-sm text-muted-foreground">
            {item.lastReviewText === "첫 복습" ? (
              <span>이 노트를 처음 복습합니다. 내용을 잘 읽어보세요.</span>
            ) : item.lastReviewText === "오늘 복습" ? (
              <span>오늘 복습날입니다. 내용을 확인해주세요.</span>
            ) : (
              <span>이 노트를 {item.lastReviewText.replace(/ 복습$/, "")}했어요. 오늘 다시 확인하면 기억이 오래갑니다.</span>
            )}
          </div>
        )}
        
        {/* 예정 복습일 (오늘이 아닌 경우만 표시) */}
        {plannedText && plannedText !== "오늘 복습 예정" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{plannedText}</span>
          </div>
        )}
      </div>
    </div>
  )
}
