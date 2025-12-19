import { authOptions } from "@/lib/auth"
import { Review, ReviewItem, ReviewTodayResponse, UIReviewItem } from "@/lib/types/review/review"
import { getServerSession } from "next-auth"
import ReviewClient from "./ReviewClient"

async function getTodayReviews(): Promise<ReviewTodayResponse['data']> {
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
    throw new Error('오늘의 복습 데이터를 가져오는데 실패했습니다.')
  }

  const result: ReviewTodayResponse = await response.json()
  return result.data || []
}

function convertToUIReviewItem(
  reviewItem: ReviewItem,
  review: Review
): UIReviewItem {
  const now = new Date()
  const plannedTime = new Date(review.plannedTime)
  const isOverdue = plannedTime < now && !reviewItem.completed
  const isCompleted = reviewItem.completed || false

  let status: "overdue" | "pending" | "completed" = "pending"
  if (isCompleted) {
    status = "completed"
  } else if (isOverdue) {
    status = "overdue"
  }

  // NOTE 타입인 경우
  if (reviewItem.itemType === "NOTE" && reviewItem.note) {
    const note = reviewItem.note
    return {
      id: reviewItem.id,
      type: "NOTE",
      content: note.content || note.title || "",
      source: note.bookTitle || "알 수 없음",
      page: undefined,
      date: note.updateDate || note.startDate || new Date().toISOString().split('T')[0],
      tags: note.tagList || [],
      title: note.title,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: note.bookId,
    }
  }
  
  // QUOTE 타입인 경우
  if (reviewItem.itemType === "QUOTE" && reviewItem.quote) {
    const quote = reviewItem.quote
    return {
      id: reviewItem.id,
      type: "QUOTE",
      content: quote.content || "",
      source: "알 수 없음", // QuoteResponse에 bookTitle이 없음
      page: quote.page,
      date: new Date().toISOString().split('T')[0],
      tags: [],
      title: undefined,
      dueDate: review.plannedTime,
      frequency: undefined,
      status,
      itemId: reviewItem.itemId,
      bookId: quote.bookId,
    }
  }

  // 기본값 (데이터가 없는 경우)
  return {
    id: reviewItem.id,
    type: reviewItem.itemType,
    content: `${reviewItem.itemType === "NOTE" ? "노트" : "인용구"} #${reviewItem.itemId}`,
    source: "알 수 없음",
    date: new Date().toISOString().split('T')[0],
    tags: [],
    dueDate: review.plannedTime,
    status,
    itemId: reviewItem.itemId,
  }
}

export default async function ReviewPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.')
  }

  const reviews = await getTodayReviews()
  
  // 모든 review의 items를 평탄화하고 UIReviewItem으로 변환
  const uiItems: UIReviewItem[] = []
  reviews.forEach(review => {
    review.items.forEach(item => {
      uiItems.push(convertToUIReviewItem(item, review))
    })
  })

  return <ReviewClient items={uiItems} />
}
