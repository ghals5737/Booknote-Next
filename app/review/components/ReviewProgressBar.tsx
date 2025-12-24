"use client"

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
    <div className="w-full px-6 sm:px-8 pt-4 pb-4">
      <div className="max-w-5xl mx-auto">
        {/* 미니멀한 프로그레스 바 - 2px 높이 */}
        <div className="h-[2px] bg-gray-200 mb-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#6366F1] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${animatedValue}%` }}
          />
        </div>
        
        {/* 상단 정보 */}
        <div className="flex items-center justify-start">
          <span className="text-sm text-[#888] font-medium">
            {completedCount} / {totalCount}
          </span>
        </div>
      </div>
    </div>
  )
}
