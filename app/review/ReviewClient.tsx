"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { completeReviewItem } from "@/lib/api/review"
import { UIReviewItem } from "@/lib/types/review/review"
import { LayoutGrid, LayoutList } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { EmptyState } from "./components/EmptyState"
import { ReviewCarousel } from "./components/ReviewCarousel"
import { ReviewListView } from "./components/ReviewListView"

interface ReviewClientProps {
  items: UIReviewItem[]
}


export default function ReviewClient({ items }: ReviewClientProps) {
  const [mode, setMode] = useState<"carousel" | "list">("carousel")
  const router = useRouter()
  const { toast } = useToast()

  const handleItemComplete = useCallback(async (itemId: number, isLastItem?: boolean) => {
    try {
      await completeReviewItem(itemId)
      
      // API 호출 성공 후, 현재 상태에서 마지막 항목인지 다시 확인
      const remainingItems = items.filter(item => item.id !== itemId && item.status !== "completed")
      const isActuallyLastItem = remainingItems.length === 0 || isLastItem
      
      if (isActuallyLastItem) {
        toast({
          title: "축하합니다! 🎉",
          description: "오늘의 복습을 모두 완료했습니다!",
          variant: "success",
        })
      } else {
        toast({
          title: "복습 완료",
          description: "복습 항목이 완료 처리되었습니다.",
          variant: "success",
        })
      }
      
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 완료 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast, items])

  const handleItemPostpone = useCallback(async (itemId: number) => {
    try {
      const { postponeReviewItem } = await import("@/lib/api/review")
      await postponeReviewItem(itemId)
      toast({
        title: "복습 연기",
        description: "복습 항목이 연기 처리되었습니다.",
        variant: "default",
      })
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "복습 연기 처리에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [router, toast])

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Carousel Mode */}
        {mode === "carousel" && (
          items.length === 0 ? (
            <EmptyState />
          ) : (
            <ReviewCarousel 
              items={items} 
              onItemComplete={async (itemId: number, isLastItem?: boolean) => {
                await handleItemComplete(itemId, isLastItem)
              }} 
            />
          )
        )}

        {/* List Mode */}
        {mode === "list" && (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-[#2D2D2D]">복습 목록</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === "carousel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("carousel")}
                  className="flex items-center gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  집중 모드
                </Button>
                <Button
                  variant={mode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("list")}
                  className="flex items-center gap-2"
                >
                  <LayoutList className="h-4 w-4" />
                  리스트 모드
                </Button>
              </div>
            </div>
            <ReviewListView 
              items={items} 
              onItemComplete={handleItemComplete} 
              onItemPostpone={handleItemPostpone} 
            />
          </div>
        )}
      </main>
    </div>
  )
}
