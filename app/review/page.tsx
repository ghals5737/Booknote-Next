import { authOptions } from "@/lib/auth"
import { Review, ReviewItem, ReviewTodayResponse, UIReviewItem } from "@/lib/types/review/review"
import { getLastReviewDate, getLastReviewText } from "@/lib/utils/review-date"
import { getServerSession } from "next-auth"
import ReviewClient from "./ReviewClient"

async function getTodayReviews(): Promise<{
  review: Review
  nextReviewDate?: string
}> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.')
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500'
  const response = await fetch(`${baseUrl}/api/v1/reviews/today`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': '*/*',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    console.error('[getTodayReviews] API 호출 실패:', response.status, errorText)
    throw new Error('오늘의 복습 데이터를 가져오는데 실패했습니다.')
  }

  const result: ReviewTodayResponse = await response.json()
  const review = result.data
  
  // 서버에서 이미 계산된 nextReviewDate 사용
  const nextReviewDate = review?.nextReviewDate
  
  console.log('[getTodayReviews] 전체 응답:', JSON.stringify(result, null, 2))
  console.log('[getTodayReviews] review:', review)
  console.log('[getTodayReviews] nextReviewDate:', nextReviewDate)
  
  return {
    review,
    nextReviewDate
  }
}

function convertToUIReviewItem(
  reviewItem: ReviewItem,
  review: Review
): UIReviewItem {
  // 완료 상태 확인: reviewItem.completed 또는 review.completedTime이 있으면 완료
  const isCompleted = reviewItem.completed || !!review.completedTime
  const status: "completed" | "pending" = isCompleted ? "completed" : "pending"
  
  // NOTE 타입인 경우
  if (reviewItem.itemType === "NOTE" && reviewItem.note) {
    const note = reviewItem.note
    // 마지막 복습일 계산 (백엔드에서 제공되면 사용, 없으면 계산)
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(
      lastReviewTime,
      note.startDate
    )
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
      reviewId: review.id,
      type: "NOTE",
      content: note.content || note.title || "",
      source: reviewItem.bookTitle || "알 수 없음",
      page: undefined,
      date: note.updateDate || note.startDate || new Date().toISOString().split('T')[0],
      tags: note.tagList || [],
      title: note.title,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: note.bookId > 0 ? note.bookId : undefined,
      completedTime: reviewItem.completedTime,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: reviewItem.reviewCount,
      lastReviewText,
    }
  }
  
  // QUOTE 타입인 경우
  if (reviewItem.itemType === "QUOTE" && reviewItem.quote) {
    const quote = reviewItem.quote
    // 마지막 복습일 계산 (백엔드에서 제공되면 사용, 없으면 계산)
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
      reviewId: review.id,
      type: "QUOTE",
      content: quote.content || "",
      source: reviewItem.bookTitle || "알 수 없음",
      page: quote.page,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      title: undefined,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: quote.bookId,
      completedTime: reviewItem.completedTime,
      lastReviewTime: lastReviewDate?.toISOString() || null,
      reviewCount: reviewItem.reviewCount,
      lastReviewText,
    }
  }

  // 기본값 (데이터가 없는 경우)
  const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
  const lastReviewDate = getLastReviewDate(lastReviewTime)
  const lastReviewText = getLastReviewText(lastReviewDate)
  
  return {
    id: reviewItem.id,
    reviewId: review.id,
    type: reviewItem.itemType,
    content: `${reviewItem.itemType === "NOTE" ? "노트" : "인용구"} #${reviewItem.itemId}`,
    source: "알 수 없음",
    date: new Date().toISOString().split('T')[0],
    tags: [],
    dueDate: review.plannedTime,
    status,
    itemId: reviewItem.itemId,
    completedTime: reviewItem.completedTime,
    lastReviewTime: lastReviewDate?.toISOString() || null,
    reviewCount: reviewItem.reviewCount,
    lastReviewText,
  }
}

export default async function ReviewPage() {
  const { review, nextReviewDate } = await getTodayReviews()
  
  console.log('[ReviewPage] nextReviewDate:', nextReviewDate)
  console.log('[ReviewPage] review:', { id: review.id, nextReviewDate: review.nextReviewDate })
  
  const uiItems: UIReviewItem[] = []
  if (review?.items) {
    review.items.forEach(item => {
      uiItems.push(convertToUIReviewItem(item, review))
    })
  }

  return <ReviewClient items={uiItems} nextReviewDate={nextReviewDate} />
}
