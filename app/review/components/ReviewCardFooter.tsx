import { Button } from "@/components/ui/button"
import { UIReviewItem } from "@/lib/types/review/review"
import { Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AssessmentType, ReviewStage } from "../types/review.types"
import { AssessmentButtonGroup } from "./AssessmentButtonGroup"
import { CompleteButton } from "./CompleteButton"
import { SourceInfo } from "./SourceInfo"
import { TagList } from "./TagList"

interface ReviewCardFooterProps {
  item: UIReviewItem
  isLoading: boolean
  stage: ReviewStage
  selectedAssessment: AssessmentType
  onComplete: (itemId: number, assessment?: AssessmentType) => void
  onAssessment?: (assessment: AssessmentType) => void
}

export function ReviewCardFooter({ 
  item, 
  isLoading, 
  stage,
  selectedAssessment,
  onComplete,
  onAssessment 
}: ReviewCardFooterProps) {
  // Revealed stage이고 평가 함수가 있으면 평가 버튼 표시
  const showAssessment = stage === "revealed" && onAssessment && item.status !== "completed"

  return (
    <div className="flex-shrink-0 flex flex-col gap-4 px-8 md:px-12 pb-8 pt-6">
      <SourceInfo source={item.source} page={item.page} date={item.date} />
      <TagList tags={item.tags} />

      {/* Assessment Buttons - 플로팅 액션 스타일 */}
      {showAssessment && (
        <>
          <AssessmentButtonGroup
            selectedAssessment={selectedAssessment}
            isLoading={isLoading}
            onAssessment={onAssessment!}
          />
          
          {/* 완료 버튼 - 평가 선택 후 표시 */}
          {selectedAssessment && (
            <CompleteButton
              isLoading={isLoading}
              isCompleted={item.status === "completed"}
              onClick={() => onComplete(item.id, selectedAssessment)}
            />
          )}
        </>
      )}

      {/* Action Buttons */}
      {!showAssessment && (
        <div className="flex gap-3">
          {item.bookId && (
            <Button variant="outline" size="lg" className="flex-1 h-12 text-sm border-[#2D2D2D]/20 text-[#2D2D2D] hover:bg-[#2D2D2D]/5" asChild title="책 상세 페이지로 이동">
              <Link href={`/book/${item.bookId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                자세히 보기
              </Link>
            </Button>
          )}
          <Button 
            size="lg" 
            className={`h-12 text-sm bg-[#6366F1] hover:bg-[#6366F1]/90 text-white ${item.bookId ? "flex-1" : "w-full"}`}
            onClick={(e) => {
              e.preventDefault()
              onComplete(item.id, null)
            }}
            disabled={isLoading || item.status === "completed"}
            title={item.status === "completed" ? "이미 완료됨" : "복습 완료"}
          >
            <Check className="mr-2 h-4 w-4" />
            {isLoading ? "처리 중..." : item.status === "completed" ? "완료됨" : "복습 완료"}
          </Button>
        </div>
      )}
    </div>
  )
}
