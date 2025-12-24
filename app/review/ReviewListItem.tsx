"use client"

import { Button } from "@/components/ui/button"
import { UIReviewItem } from "@/lib/types/review/review"
import { Calendar, Check, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ReviewListItemProps {
  item: UIReviewItem
  onComplete: (itemId: number, assessment?: "forgot" | "hard" | "easy" | null) => Promise<void>
  onPostpone: (itemId: number) => Promise<void>
}

export function ReviewListItem({ item, onComplete, onPostpone }: ReviewListItemProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    if (isLoading || item.status === "completed") return
    setIsLoading(true)
    try {
      await onComplete(item.id, null) // 리스트 뷰에서는 평가 없이 완료 (기본값 NORMAL 사용)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostpone = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onPostpone(item.id)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{item.title || item.content.substring(0, 30)}</h3>
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${
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
          </div>
          <div className="text-sm text-muted-foreground mb-2">{item.source}</div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {item.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>다음 복습: {item.dueDate}</span>
              </div>
            )}
            {item.frequency && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{item.frequency}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.bookId && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href={`/book/${item.bookId}`}>
                <Eye className="w-5 h-5" />
              </Link>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-yellow-600"
            onClick={handlePostpone}
            disabled={isLoading || item.status === "completed"}
            title="복습 연기"
          >
            <Clock className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-green-600"
            onClick={handleComplete}
            disabled={isLoading || item.status === "completed"}
            title={item.status === "completed" ? "이미 완료됨" : "복습 완료"}
          >
            <Check className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

