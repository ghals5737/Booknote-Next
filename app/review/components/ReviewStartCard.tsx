import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"

interface ReviewStartCardProps {
  onStart: () => void
  totalCount: number
  isAllCompleted: boolean
}

export function ReviewStartCard({ onStart, totalCount, isAllCompleted }: ReviewStartCardProps) {
  const estimatedMinutes = Math.max(1, Math.ceil((totalCount * 5) / 60))

  return (
    <Card className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col overflow-hidden bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-0">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
        <motion.div
          className="flex items-center justify-center w-20 h-20 rounded-full bg-[#6366F1]/10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <BookOpen className="w-10 h-10 text-[#6366F1]" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
            {isAllCompleted ? "오늘의 복습을 모두 완료했어요" : "오늘의 복습"}
          </h2>
          {isAllCompleted ? (
            <>
              <p className="text-[#888] text-lg">
                오늘은 총{" "}
                <span className="font-semibold text-[#2D2D2D]">{totalCount}</span>
                개의 카드를 복습했어요
              </p>
              <p className="text-sm text-[#888]">
                오늘 복습한 카드는 복습 기록에서 다시 확인할 수 있어요
              </p>
            </>
          ) : (
            <>
              <p className="text-[#888] text-lg">
                총 <span className="font-semibold text-[#2D2D2D]">{totalCount}</span>개의 카드가 기다리고 있어요
              </p>
              <p className="text-sm text-[#888]">
                약 <span className="font-semibold text-[#2D2D2D]">{estimatedMinutes}</span>분이면 충분해요
              </p>
            </>
          )}
        </div>

        {!isAllCompleted && (
          <>
            <p className="text-sm text-[#888] max-w-md">
              중요한 노트들을 정기적으로 복습하면 기억에 오래 남아요
            </p>

            <div className="mt-4 flex flex-col items-center gap-3">
              <Button
                size="lg"
                onClick={onStart}
                className="px-8 py-6 text-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
              >
                복습 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {/* 키보드 단축키 안내 - 버튼 아래 작은 텍스트 */}
              <div className="flex items-center gap-2 text-xs text-[#888]">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#F8F7F4] rounded text-xs font-mono border border-[#2D2D2D]/10">
                    ←
                  </kbd>
                  <span>/</span>
                  <kbd className="px-1.5 py-0.5 bg-[#F8F7F4] rounded text-xs font-mono border border-[#2D2D2D]/10">
                    →
                  </kbd>
                  <span className="ml-1">이전/다음</span>
                </div>
                <span className="text-[#2D2D2D]/30">•</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-[#F8F7F4] rounded text-xs font-mono border border-[#2D2D2D]/10">
                    Space
                  </kbd>
                  <span className="ml-1">내용 보기</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}


