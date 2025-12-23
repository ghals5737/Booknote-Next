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
    <div className="flex-shrink-0 px-8 md:px-12 pt-6 pb-6">
      {/* 타입 배지 - 보더만 있는 미니멀한 스타일 */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {item.type === "NOTE" ? (
          <Badge variant="outline" className="flex items-center gap-1.5 w-fit text-xs border-[#2D2D2D]/20 text-[#2D2D2D]/70 bg-transparent">
            <FileText className="h-3 w-3" />
            노트
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1.5 w-fit text-xs border-[#2D2D2D]/20 text-[#2D2D2D]/70 bg-transparent">
            <Quote className="h-3 w-3" />
            인용구
          </Badge>
        )}
        
        {/* 복습 횟수 */}
        {reviewCountText && (
          <span className="text-xs text-[#888]">{reviewCountText}</span>
        )}
      </div>

      {/* 컨텍스트 정보 - 더 미니멀하게, 여백 증가 */}
      {(item.lastReviewText || (plannedText && plannedText !== "오늘 복습 예정")) && (
        <div className="space-y-1.5 mb-2">
          {/* 마지막 복습 정보 */}
          {item.lastReviewText && (
            <div className="text-sm text-[#888]">
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
            <div className="flex items-center gap-1.5 text-xs text-[#888]">
              <Calendar className="h-3 w-3" />
              <span>{plannedText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
