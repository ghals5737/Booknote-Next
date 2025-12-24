import { UIReviewItem } from "@/lib/types/review/review"
import { useMemo } from "react"

export function useReviewProgress(items: UIReviewItem[]) {
  return useMemo(() => {
    // status가 "completed"인 항목 수를 카운트
    const completedCount = items.filter(item => item.status === "completed").length
    
    return {
      completedCount,
      totalCount: items.length
    }
  }, [items])
}
