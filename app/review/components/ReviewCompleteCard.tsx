"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Sparkles } from "lucide-react"

interface ReviewCompleteCardProps {
  totalCount: number
  nextReviewDate?: string  // 다음 복습 예정일 (ISO 8601 형식)
}

export function ReviewCompleteCard({ totalCount }: ReviewCompleteCardProps) {

  return (
    <Card 
      className="flex flex-col overflow-hidden bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-0"
    >
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center space-y-4 max-w-3xl mx-auto">
        {/* 축하 아이콘 */}
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/10">
            <CheckCircle2 className="w-8 h-8 text-[#6366F1]" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3 w-full max-w-2xl">
          {/* 메인 메시지 */}
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl text-[#2D2D2D]">
              오늘 복습을 완료했습니다.
            </h2>
            <p className="text-sm text-[#888]">
              총 <span className="font-semibold text-[#2D2D2D]">{totalCount}</span>개의 카드를 복습했습니다
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

