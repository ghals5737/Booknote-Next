"use client"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { UIReviewItem } from "@/lib/types/review/review"
import { Calendar, Check, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ReviewListItemProps {
  item: UIReviewItem
  onComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => Promise<void>
  onSnooze: (itemId: number) => Promise<void>
  hideActions?: boolean // 히스토리 페이지에서 액션 버튼 숨기기
}

export function ReviewListItem({ item, onComplete, onSnooze, hideActions = false }: ReviewListItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()

  const handleComplete = async () => {
    if (isLoading || item.status === "completed") return
    setIsLoading(true)
    try {
      await onComplete(item.id, null) // 리스트 뷰에서는 평가 없이 완료 (기본값 NORMAL 사용)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSnooze = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onSnooze(item.id)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary/50 active:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-[#2D2D2D] line-clamp-1`}>
              {item.title || item.content.substring(0, isMobile ? 25 : 30)}
            </h3>
            {item.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium flex-shrink-0 ${
                  item.status === "overdue"
                    ? "bg-red-100 text-red-700"
                    : item.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {tag}
              </span>
            ))}
            {item.tags.length > (isMobile ? 2 : 3) && (
              <span className="text-xs text-muted-foreground">+{item.tags.length - (isMobile ? 2 : 3)}</span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 line-clamp-1">{item.source}</div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{item.content}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {item.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="line-clamp-1">다음 복습: {item.dueDate}</span>
              </div>
            )}
            {item.frequency && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="line-clamp-1">{item.frequency}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {item.bookId && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground h-10 w-10 sm:h-9 sm:w-9" 
              asChild
            >
              <Link href={`/book/${item.bookId}`}>
                <Eye className="w-5 h-5" />
              </Link>
            </Button>
          )}
          {!hideActions && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-yellow-600 active:bg-yellow-50 h-10 w-10 sm:h-9 sm:w-9"
                onClick={handleSnooze}
                disabled={isLoading || item.status === "completed"}
                title="복습 연기"
              >
                <Clock className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-green-600 active:bg-green-50 h-10 w-10 sm:h-9 sm:w-9"
                onClick={handleComplete}
                disabled={isLoading || item.status === "completed"}
                title={item.status === "completed" ? "이미 완료됨" : "복습 완료"}
              >
                <Check className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

