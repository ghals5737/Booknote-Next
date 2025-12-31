import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { COMPLETE_BUTTON_STYLES } from "../constants/review.constants"

interface CompleteButtonProps {
  isLoading: boolean
  isCompleted: boolean
  onClick: () => void
}

export function CompleteButton({
  isLoading,
  isCompleted,
  onClick,
}: CompleteButtonProps) {
  return (
    <Button
      size="lg"
      className={`${COMPLETE_BUTTON_STYLES.base} ${COMPLETE_BUTTON_STYLES.gradient} ${COMPLETE_BUTTON_STYLES.shadow} relative`}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={isLoading || isCompleted}
      title={isCompleted ? "이미 완료됨" : isLoading ? "처리 중..." : "복습 완료 (Enter)"}
    >
      <Check className="mr-2 h-5 w-5" />
      <span className="flex-1">{isLoading ? "처리 중..." : "복습 완료"}</span>
      {!isLoading && !isCompleted && (
        <span className="text-xs opacity-70 ml-1">(Enter)</span>
      )}
    </Button>
  )
}

