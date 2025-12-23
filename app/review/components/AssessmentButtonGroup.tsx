import { AssessmentType } from "../types/review.types"
import { AssessmentButton } from "./AssessmentButton"

interface AssessmentButtonGroupProps {
  selectedAssessment: AssessmentType | null
  isLoading: boolean
  onAssessment: (assessment: AssessmentType) => void
}

export function AssessmentButtonGroup({
  selectedAssessment,
  isLoading,
  onAssessment,
}: AssessmentButtonGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#888] text-center mb-1">
        기억나시나요?
      </p>
      <div className="flex gap-3">
        <AssessmentButton
          assessment="forgot"
          selectedAssessment={selectedAssessment}
          isLoading={isLoading}
          onSelect={onAssessment}
        />
        <AssessmentButton
          assessment="hard"
          selectedAssessment={selectedAssessment}
          isLoading={isLoading}
          onSelect={onAssessment}
        />
        <AssessmentButton
          assessment="easy"
          selectedAssessment={selectedAssessment}
          isLoading={isLoading}
          onSelect={onAssessment}
        />
      </div>
    </div>
  )
}

