import { authOptions } from "@/lib/auth"
import { Review, ReviewItem, UIReviewItem } from "@/lib/types/review/review"
import { getLastReviewDate, getLastReviewText } from "@/lib/utils/review-date"
import { getServerSession } from "next-auth"
import HistoryClient from "./HistoryClient"

// 히스토리 API 응답 타입
interface ReviewHistoryItem {
  id: number
  reviewId: number
  itemType: "NOTE" | "QUOTE"
  itemId: number
  completed: boolean
  completedTime: string | null
  note: any | null
  quote: any | null
  bookTitle: string | null
  lastReviewTime?: string | null
  reviewCount?: number
}

interface ReviewHistory {
  id: number
  completed: boolean
  plannedTime: string
  completedTime: string | null
  reviewItems: ReviewHistoryItem[]
}

interface ReviewHistoryResponse {
  success: boolean
  status: number
  message: string
  data: ReviewHistory[]
  timestamp: string | null
}

async function getCompletedReviews(): Promise<Review[]> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.')
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500'
  
  const response = await fetch(`${baseUrl}/api/v1/reviews/history`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': '*/*',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('복습 히스토리 데이터를 가져오는데 실패했습니다.')
  }

  const result: ReviewHistoryResponse = await response.json()
  
  // 히스토리 응답을 기존 Review 구조로 변환
  return result.data.map(review => ({
    id: review.id,
    plannedTime: review.plannedTime,
    completedTime: review.completedTime,
    items: review.reviewItems.map(item => ({
      id: item.id,
      reviewId: item.reviewId,
      itemType: item.itemType,
      itemId: item.itemId,
      completed: item.completed,
      completedTime: item.completedTime,
      note: item.note,
      quote: item.quote,
      bookTitle: item.bookTitle,
      lastReviewTime: item.lastReviewTime,
      reviewCount: item.reviewCount,
    }))
  }))
}

function convertToUIReviewItem(
  reviewItem: ReviewItem,
  review: Review
): UIReviewItem {
  // 히스토리에서는 모든 항목이 완료된 상태
  const status: "completed" = "completed"
  
  // NOTE 타입인 경우
  if (reviewItem.itemType === "NOTE" && reviewItem.note) {
    const note = reviewItem.note
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(
      lastReviewTime,
      note.startDate
    )
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
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
    const lastReviewTime = reviewItem.lastReviewTime || reviewItem.completedTime || null
    const lastReviewDate = getLastReviewDate(lastReviewTime)
    const lastReviewText = getLastReviewText(lastReviewDate)
    
    return {
      id: reviewItem.id,
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

export default async function ReviewHistoryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('인증이 필요합니다.')
  }

  const reviews = await getCompletedReviews()
  
  // 모든 review의 items를 평탄화하고 UIReviewItem으로 변환
  const uiItems: UIReviewItem[] = []
  reviews.forEach(review => {
    review.items.forEach(item => {
      uiItems.push(convertToUIReviewItem(item, review))
    })
  })

  // 완료 시간 기준으로 최신순 정렬
  uiItems.sort((a, b) => {
    const timeA = a.completedTime ? new Date(a.completedTime).getTime() : 0
    const timeB = b.completedTime ? new Date(b.completedTime).getTime() : 0
    return timeB - timeA
  })

  return <HistoryClient items={uiItems} />
}

