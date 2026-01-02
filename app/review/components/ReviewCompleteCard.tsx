"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Home, Lock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { CARD_STYLES } from "../constants/review.constants"

interface ReviewCompleteCardProps {
  totalCount: number
  nextReviewDate?: string  // 다음 복습 예정일 (ISO 8601 형식)
}

export function ReviewCompleteCard({ totalCount, nextReviewDate }: ReviewCompleteCardProps) {
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  // 다음 복습 예정일 포맷팅
  const formatNextReviewDate = (dateString?: string): string => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // 날짜 비교 (시간 제외)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      
      if (dateOnly.getTime() === todayOnly.getTime()) {
        return "오늘"
      } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
        return "내일"
      } else {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch (error) {
      return ""
    }
  }

  const formattedDate = formatNextReviewDate(nextReviewDate)

  return (
    <Card 
      className={CARD_STYLES.base}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 text-center space-y-5 max-w-3xl mx-auto">
        {/* 축하 아이콘 */}
        <div className="relative">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/10">
            <CheckCircle2 className="w-12 h-12 text-[#6366F1]" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D2D2D]">
            축하합니다! 🎉
          </h2>
          <p className="text-[#888] text-lg">
            오늘의 복습을 모두 완료했어요
          </p>
          <p className="text-sm text-[#888]">
            총 <span className="font-semibold text-[#2D2D2D]">{totalCount}</span>개의 카드를 복습했습니다
          </p>
        </div>

        <div className="max-w-md space-y-2 pt-4">
          <p className="text-sm text-[#888] leading-relaxed">
            꾸준한 복습은 기억을 오래 유지하는 데 도움이 됩니다.
            <br />
            내일도 화이팅! 💪
          </p>
        </div>

        {/* 다음 복습 예정일 표시 */}
        {nextReviewDate && formattedDate && (
          <div className="mt-6 px-6 py-4 bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-lg border border-[#6366F1]/20 flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#6366F1]" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-[#888] mb-1">다음 복습 예정일</p>
              <p className="text-base font-semibold text-[#2D2D2D]">
                {formattedDate}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 w-full max-w-xs">
          <Button
            onClick={handleGoToDashboard}
            className="w-full h-12 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            <Home className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    </Card>
  )
}

