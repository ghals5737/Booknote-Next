"use client"

import { Markdown } from "@/components/note/Markdown"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UIReviewItem } from "@/lib/types/review/review"
import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { ANIMATION_CONFIG, CARD_STYLES, QUOTE_MARK_CONFIG } from "../constants/review.constants"
import { AssessmentType, ReviewStage } from "../types/review.types"
import { AssessmentButtonGroup } from "./AssessmentButtonGroup"
import { CompleteButton } from "./CompleteButton"
import { GrowthIcon } from "./GrowthIcon"

interface FlashcardReviewItemProps {
  item: UIReviewItem
  isLoading: boolean
  onComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => void
  lastReviewHint?: string // 이전 복습 기록 힌트 (예: "지난번엔 어려웠어요라고 하셨어요")
}

const MotionCard = motion(Card)

export function FlashcardReviewItem({ item, isLoading, onComplete, lastReviewHint }: FlashcardReviewItemProps) {
  const [stage, setStage] = useState<ReviewStage>("recall") // "recall" 또는 "revealed"
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>(null)

  const handleReveal = useCallback(() => {
    setStage("revealed")
  }, [])

  const handleAssessment = useCallback((assessment: AssessmentType) => {
    setSelectedAssessment(assessment)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete(item.id, selectedAssessment)
  }, [item.id, onComplete, selectedAssessment])

  // 키보드 단축키 처리
  useEffect(() => {
    if (item.status === "completed" || isLoading) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // Space 또는 Enter: 내용 보기
      if ((e.key === " " || e.key === "Enter") && stage === "recall") {
        e.preventDefault()
        handleReveal()
      }
      // 1 또는 F: 잊음
      else if ((e.key === "1" || e.key === "f" || e.key === "F") && stage === "revealed") {
        e.preventDefault()
        handleAssessment("forgot")
      }
      // 2 또는 H: 어려움
      else if ((e.key === "2" || e.key === "h" || e.key === "H") && stage === "revealed") {
        e.preventDefault()
        handleAssessment("hard")
      }
      // 3 또는 E: 쉬움
      else if ((e.key === "3" || e.key === "e" || e.key === "E") && stage === "revealed") {
        e.preventDefault()
        handleAssessment("easy")
      }
      // Enter: 완료 (평가가 선택된 경우)
      else if (e.key === "Enter" && selectedAssessment && stage === "revealed") {
        e.preventDefault()
        handleComplete()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [item.status, isLoading, stage, selectedAssessment, handleReveal, handleAssessment, handleComplete])

  // 인용문 길이에 따라 글자 크기 조절
  const contentLength = item.content?.length ?? 0
  let quoteTextSizeClass = "text-2xl md:text-3xl lg:text-4xl"
  if (contentLength > 220) {
    quoteTextSizeClass = "text-lg md:text-xl lg:text-2xl"
  } else if (contentLength > 120) {
    quoteTextSizeClass = "text-xl md:text-2xl lg:text-3xl"
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
      {/* 헤더 - 성장 아이콘 */}
      <div className="flex-shrink-0 px-8 md:px-12 pt-6 pb-4 flex items-center justify-end">
        <GrowthIcon reviewCount={item.reviewCount} />
      </div>

      {/* 앞면 (Recall) - 책 제목만 표시 */}
      {stage === "recall" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-12 py-10">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-2">
                {item.source}
              </h2>
              <p className="text-lg md:text-xl text-[#888] mt-6">
                이 책에서 기억하는 문장이 있나요?
              </p>
            </div>
            
            {lastReviewHint && (
              <p className="text-sm text-[#888] mt-4">
                {lastReviewHint}
              </p>
            )}

            <Button
              size="lg"
              onClick={handleReveal}
              className="h-12 px-8 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
            >
              내용 보기
            </Button>
          </div>
        </div>
      )}

      {/* 뒷면 (Revealed) - 내용 + 당시 생각 + 난이도 선택 */}
      {stage === "revealed" && (
        <>
          {/* 내용 */}
          <div className={`flex-1 min-h-0 overflow-hidden ${CARD_STYLES.padding.horizontal}`}>
            <div className="h-full overflow-y-auto">
              {item.type === "QUOTE" ? (
                <div className={`relative flex items-center justify-center h-full ${CARD_STYLES.padding.vertical}`}>
                  <div
                    className={`pointer-events-none select-none absolute ${QUOTE_MARK_CONFIG.position.top} ${QUOTE_MARK_CONFIG.position.left} text-[#2D2D2D]`}
                    style={{
                      fontSize: QUOTE_MARK_CONFIG.fontSize,
                      lineHeight: "1",
                      fontFamily: "serif",
                      opacity: QUOTE_MARK_CONFIG.opacity,
                    }}
                  >
                    &ldquo;
                  </div>
                  <div
                    className={`pointer-events-none select-none absolute ${QUOTE_MARK_CONFIG.position.bottom} ${QUOTE_MARK_CONFIG.position.right} text-[#2D2D2D]`}
                    style={{
                      fontSize: QUOTE_MARK_CONFIG.fontSize,
                      lineHeight: "1",
                      fontFamily: "serif",
                      opacity: QUOTE_MARK_CONFIG.opacity,
                    }}
                  >
                    &rdquo;
                  </div>
                  <p className={`text-center leading-relaxed px-12 md:px-16 lg:px-20 ${quoteTextSizeClass} font-serif text-[#2D2D2D] relative z-10`}>
                    {item.content}
                  </p>
                </div>
              ) : (
                <div className="w-full py-4">
                  <Markdown content={item.content} />
                </div>
              )}
            </div>
          </div>

          {/* 푸터 - 난이도 선택 */}
          <div className="flex-shrink-0 flex flex-col gap-4 px-8 md:px-12 pb-8 pt-6">
            <AssessmentButtonGroup
              selectedAssessment={selectedAssessment}
              isLoading={isLoading}
              onAssessment={handleAssessment}
            />
            
            {selectedAssessment && (
              <CompleteButton
                isLoading={isLoading}
                isCompleted={item.status === "completed"}
                onClick={handleComplete}
              />
            )}
          </div>
        </>
      )}
    </MotionCard>
  )
}

