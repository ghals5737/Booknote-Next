"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, History, Home, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { CARD_STYLES } from "../constants/review.constants"

interface ReviewCompleteCardProps {
  totalCount: number
}

export function ReviewCompleteCard({ totalCount }: ReviewCompleteCardProps) {
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleGoToHistory = () => {
    router.push('/review/history')
  }

  return (
    <Card 
      className={`${CARD_STYLES.base} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={handleGoToHistory}
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

        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              handleGoToHistory()
            }}
            variant="default"
            className="flex-1 px-8 py-6 text-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
          >
            <History className="mr-2 h-5 w-5" />
            복습 히스토리
          </Button>
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation()
              handleGoToDashboard()
            }}
            variant="outline"
            className="flex-1 px-8 py-6 text-lg"
          >
            <Home className="mr-2 h-5 w-5" />
            대시보드
          </Button>
        </div>
      </div>
    </Card>
  )
}

