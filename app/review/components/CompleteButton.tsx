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
      className={`${COMPLETE_BUTTON_STYLES.base} ${COMPLETE_BUTTON_STYLES.gradient} ${COMPLETE_BUTTON_STYLES.shadow}`}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={isLoading || isCompleted}
    >
      <Check className="mr-2 h-5 w-5" />
      {isLoading ? "처리 중..." : "복습 완료"}
    </Button>
  )
}

