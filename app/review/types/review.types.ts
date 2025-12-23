// 리뷰 관련 공통 타입 정의

// UI에서 사용하는 평가 값 (소문자)
export type AssessmentType = "forgot" | "hard" | "easy" | null

// 서버 API에 보내는 응답 값 (대문자)
export type ReviewResponseType = "EASY" | "NORMAL" | "DIFFICULT" | "FORGOT"

export type ReviewStage = "recall" | "revealed"

export type ReviewItemStatus = "overdue" | "pending" | "completed"

export interface AssessmentButtonConfig {
  type: Exclude<AssessmentType, null>
  label: string
  icon: React.ComponentType<{ className?: string }>
  selectedStyles: string
  unselectedStyles: string
}

// UI 선택값 -> 서버 응답값 매핑
export const ASSESSMENT_TO_REVIEW_RESPONSE: Record<
  Exclude<AssessmentType, null>,
  ReviewResponseType
> = {
  forgot: "FORGOT",
  hard: "DIFFICULT",
  easy: "EASY",
}

