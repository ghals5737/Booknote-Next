// 리뷰 관련 상수 정의

import { Frown, Meh, Smile } from "lucide-react"
import { AssessmentButtonConfig } from "../types/review.types"

// 디자인 시스템 색상
export const REVIEW_COLORS = {
  primary: {
    main: "#6366F1",
    dark: "#4F46E5",
    light: "#6366F1/80",
    hover: "#6366F1/90",
    shadow: "#6366F1/20",
  },
  text: {
    primary: "#2D2D2D",
    secondary: "#888",
    muted: "#2D2D2D/70",
  },
  assessment: {
    forgot: {
      selected: "bg-red-500 hover:bg-red-600 text-white border-0",
      unselected: "border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200",
    },
    hard: {
      selected: "bg-orange-500 hover:bg-orange-600 text-white border-0",
      unselected: "border-orange-100 text-orange-500 hover:bg-orange-50 hover:border-orange-200",
    },
    easy: {
      selected: "bg-[#6366F1]/80 hover:bg-[#6366F1] text-white border-0",
      unselected: "border-[#6366F1]/30 text-[#6366F1]/70 hover:bg-[#6366F1]/5 hover:border-[#6366F1]/40",
    },
  },
  badge: {
    border: "#2D2D2D/20",
    text: "#2D2D2D/70",
  },
} as const

// 카드 스타일
export const CARD_STYLES = {
  base: "h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col overflow-hidden bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-0",
  padding: {
    horizontal: "px-8 md:px-12",
    vertical: "py-10",
  },
} as const

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  card: {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.98 },
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
} as const

// 인용구 따옴표 설정
export const QUOTE_MARK_CONFIG = {
  // 카드 전체와 텍스트 비율에 맞춘 따옴표 크기/위치
  fontSize: "72px",
  opacity: 0.08,
  position: {
    // 텍스트를 더 잘 감싸도록 바깥쪽으로 배치
    top: "top-12",
    left: "left-4 md:left-6",
    bottom: "bottom-12",
    right: "right-2 md:right-4",
  },
} as const

// 평가 버튼 설정
export const ASSESSMENT_BUTTONS: AssessmentButtonConfig[] = [
  {
    type: "forgot",
    label: "잊음",
    icon: Frown,
    selectedStyles: REVIEW_COLORS.assessment.forgot.selected,
    unselectedStyles: REVIEW_COLORS.assessment.forgot.unselected,
  },
  {
    type: "hard",
    label: "어려움",
    icon: Meh,
    selectedStyles: REVIEW_COLORS.assessment.hard.selected,
    unselectedStyles: REVIEW_COLORS.assessment.hard.unselected,
  },
  {
    type: "easy",
    label: "쉬움",
    icon: Smile,
    selectedStyles: REVIEW_COLORS.assessment.easy.selected,
    unselectedStyles: REVIEW_COLORS.assessment.easy.unselected,
  },
] as const

// 완료 버튼 스타일
export const COMPLETE_BUTTON_STYLES = {
  base: "w-full h-14 text-base font-semibold text-white mt-3 shadow-lg transition-all",
  gradient: "bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#6366F1]/90 hover:to-[#4F46E5]/90",
  shadow: "shadow-[#6366F1]/20",
} as const

