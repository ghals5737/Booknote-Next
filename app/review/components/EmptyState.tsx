"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, History } from "lucide-react"
import { useRouter } from "next/navigation"

export function EmptyState() {
  const router = useRouter()

  const handleGoToHistory = () => {
    router.push('/review/history')
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">복습할 항목이 없습니다</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          오늘 복습할 노트나 인용구가 없습니다.<br />
          새로운 노트나 인용구를 추가하면 복습 목록에 추가됩니다.
        </p>
        <Button
          onClick={handleGoToHistory}
          variant="outline"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          복습 히스토리 보기
        </Button>
      </CardContent>
    </Card>
  )
}
