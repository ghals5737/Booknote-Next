import { Button } from "@/components/ui/button"
import { ASSESSMENT_BUTTONS } from "../constants/review.constants"
import { AssessmentType } from "../types/review.types"

interface AssessmentButtonProps {
  assessment: AssessmentType
  selectedAssessment: AssessmentType | null
  isLoading: boolean
  onSelect: (assessment: AssessmentType) => void
}

export function AssessmentButton({
  assessment,
  selectedAssessment,
  isLoading,
  onSelect,
}: AssessmentButtonProps) {
  const config = ASSESSMENT_BUTTONS.find((btn) => btn.type === assessment)
  if (!config) return null

  const isSelected = selectedAssessment === assessment
  const Icon = config.icon

  // 키보드 단축키 매핑
  const keyboardShortcut = {
    forgot: "1 / F",
    hard: "2 / H",
    easy: "3 / E",
  }[assessment as Exclude<AssessmentType, null>]

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="lg"
      className={`flex-1 h-12 text-sm transition-all relative ${
        isSelected ? config.selectedStyles : config.unselectedStyles
      }`}
      onClick={() => onSelect(assessment)}
      disabled={isLoading}
      title={`${config.label} (${keyboardShortcut})`}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span className="flex-1">{config.label}</span>
      <span className="text-xs opacity-70 ml-1">({keyboardShortcut})</span>
    </Button>
  )
}

