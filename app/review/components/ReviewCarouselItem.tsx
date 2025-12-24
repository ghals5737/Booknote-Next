"use client"

import { Card } from "@/components/ui/card"
import { UIReviewItem } from "@/lib/types/review/review"
import { motion } from "framer-motion"
import { useState } from "react"
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

  const handleAssessment = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment)
  }

  const handleComplete = () => {
    onComplete(item.id, selectedAssessment)
  }

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
