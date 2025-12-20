"use client"

import { Review } from "@/lib/types/review/review"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ReminderClientProps {
  reviews: Review[]
}

export default function ReminderClient({ reviews }: ReminderClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />대시보드로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-balance">오늘의 복습</h1>
          <p className="text-muted-foreground">오늘 복습해야 할 항목들을 확인하세요</p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">오늘 복습할 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">
                    계획된 시간: {new Date(review.plannedTime).toLocaleString('ko-KR')}
                  </h2>
                  {review.completedTime && (
                    <p className="text-sm text-muted-foreground">
                      완료 시간: {new Date(review.completedTime).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {review.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <span className="text-sm font-medium">
                          {item.itemType === "NOTE" ? "노트" : "인용구"} #{item.itemId}
                        </span>
                        {item.completed && (
                          <span className="ml-2 text-xs text-green-600">완료</span>
                        )}
                      </div>
                      {item.completedTime && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.completedTime).toLocaleString('ko-KR')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

