import { UIReviewItem } from "@/lib/types/review/review"
import { useMemo } from "react"

export function useReviewProgress(items: UIReviewItem[]) {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const completedTodayCount = items.filter(item => {
      if (!item.completedTime) return false
      const completedDate = new Date(item.completedTime).toISOString().split('T')[0]
      return completedDate === today
    }).length
    
    return {
      completedCount: completedTodayCount,
      totalCount: items.length
    }
  }, [items])
}
