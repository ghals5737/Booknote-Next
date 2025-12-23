// 리뷰 관련 공통 타입 정의

export type AssessmentType = "forgot" | "hard" | "easy" | null

export type ReviewStage = "recall" | "revealed"

export type ReviewItemStatus = "overdue" | "pending" | "completed"

export interface AssessmentButtonConfig {
  type: AssessmentType
  label: string
  icon: React.ComponentType<{ className?: string }>
  selectedStyles: string
  unselectedStyles: string
}

