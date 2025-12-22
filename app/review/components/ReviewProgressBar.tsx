"use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface ReviewProgressBarProps {
  completedCount: number
  totalCount: number
}

export function ReviewProgressBar({ completedCount, totalCount }: ReviewProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const targetValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  useEffect(() => {
    // 진행률 값을 애니메이션과 함께 업데이트
    const duration = 300 // 300ms 애니메이션
    const startValue = animatedValue
    const difference = targetValue - startValue
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // ease-out 함수 사용
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + difference * easeOut
      
      setAnimatedValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setAnimatedValue(targetValue)
      }
    }

    if (targetValue !== animatedValue) {
      requestAnimationFrame(animate)
    }
  }, [targetValue, animatedValue])

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-semibold">
          {completedCount} / {totalCount}
        </span>
      </div>
      <Progress value={animatedValue} className="h-2 transition-none" />
    </div>
  )
}
