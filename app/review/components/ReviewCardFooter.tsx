import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UIReviewItem } from "@/lib/types/review/review"
import { Check, ExternalLink, Frown, Meh, Smile } from "lucide-react"
import Link from "next/link"

interface ReviewCardFooterProps {
  item: UIReviewItem
  isLoading: boolean
  stage: "recall" | "revealed"
  onComplete: (itemId: number) => void
  onAssessment?: () => void
}

export function ReviewCardFooter({ 
  item, 
  isLoading, 
  stage,
  onComplete,
  onAssessment 
}: ReviewCardFooterProps) {
  // Revealed stage이고 평가 함수가 있으면 평가 버튼 표시
  const showAssessment = stage === "revealed" && onAssessment && item.status !== "completed"

  return (
    <div className="flex-shrink-0 flex flex-col gap-2 px-4 pb-3 pt-2 border-t">
      {/* Source and Date */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
        <span className="font-medium">{item.source}</span>
        {item.page && item.page > 0 && (
          <>
            <span>·</span>
            <span>{item.page}p</span>
          </>
        )}
        <span>·</span>
        <span>{item.date}</span>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 -mt-1">
          {item.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Assessment Buttons - 내용 본 후 표시 */}
      {showAssessment && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            기억하고 계셨나요? 얼마나 잘 기억하시는지 알려주세요
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={onAssessment}
              disabled={isLoading}
            >
              <Smile className="mr-1.5 h-4 w-4" />
              쉬움
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={onAssessment}
              disabled={isLoading}
            >
              <Meh className="mr-1.5 h-4 w-4" />
              어려움
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={onAssessment}
              disabled={isLoading}
            >
              <Frown className="mr-1.5 h-4 w-4" />
              잊음
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {item.bookId ? (
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
            <Link href={`/book/${item.bookId}`}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              자세히 보기
            </Link>
          </Button>
        ) : null}
        {!showAssessment && (
          <Button 
            size="sm" 
            className={`h-8 text-xs ${item.bookId ? "flex-1" : "w-full"}`}
            onClick={(e) => {
              e.preventDefault()
              onComplete(item.id)
            }}
            disabled={isLoading || item.status === "completed"}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {isLoading ? "처리 중..." : item.status === "completed" ? "완료됨" : "완료"}
          </Button>
        )}
      </div>
    </div>
  )
}
