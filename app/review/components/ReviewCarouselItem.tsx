"use client"

import { Card } from "@/components/ui/card"
import { UIReviewItem } from "@/lib/types/review/review"
import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { ANIMATION_CONFIG, CARD_STYLES } from "../constants/review.constants"
import { AssessmentType } from "../types/review.types"
import { ReviewCardContent } from "./ReviewCardContent"
import { ReviewCardFooter } from "./ReviewCardFooter"
import { ReviewCardHeader } from "./ReviewCardHeader"

interface ReviewCarouselItemProps {
  item: UIReviewItem
  isLoading: boolean
  onComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => void
}

const MotionCard = motion(Card)

export function ReviewCarouselItem({ item, isLoading, onComplete }: ReviewCarouselItemProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>(null)

  const handleAssessment = useCallback((assessment: AssessmentType) => {
    setSelectedAssessment(assessment)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete(item.id, selectedAssessment)
  }, [item.id, onComplete, selectedAssessment])

  // 키보드 단축키 처리
  useEffect(() => {
    // 완료된 항목이거나 로딩 중이면 키보드 이벤트 무시
    if (item.status === "completed" || isLoading) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에 포커스가 있으면 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // 1 또는 F: 잊음
      if (e.key === "1" || e.key === "f" || e.key === "F") {
        e.preventDefault()
        handleAssessment("forgot")
      }
      // 2 또는 H: 어려움
      else if (e.key === "2" || e.key === "h" || e.key === "H") {
        e.preventDefault()
        handleAssessment("hard")
      }
      // 3 또는 E: 쉬움
      else if (e.key === "3" || e.key === "e" || e.key === "E") {
        e.preventDefault()
        handleAssessment("easy")
      }
      // Enter: 완료 (평가가 선택된 경우)
      else if (e.key === "Enter" && selectedAssessment) {
        e.preventDefault()
        handleComplete()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [item.status, isLoading, selectedAssessment, handleAssessment, handleComplete])

  return (
    <MotionCard
      layout
      initial={ANIMATION_CONFIG.card.initial}
      animate={ANIMATION_CONFIG.card.animate}
      exit={ANIMATION_CONFIG.card.exit}
      transition={ANIMATION_CONFIG.card.transition}
      className={CARD_STYLES.base}
    >
      <ReviewCardHeader item={item} />
      <ReviewCardContent item={item} />
      <ReviewCardFooter 
        item={item} 
        isLoading={isLoading} 
        stage="revealed"
        selectedAssessment={selectedAssessment}
        onComplete={handleComplete}
        onAssessment={handleAssessment}
      />
    </MotionCard>
  )
}
