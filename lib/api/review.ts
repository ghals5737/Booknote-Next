// 복습 관련 API 함수

import { ReviewResponseType } from "@/app/review/types/review.types"
import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'

export interface ReviewItemSuccessResponse {
  success: boolean
  status: number
  message: string
  data: string | {
    message: string
    nextReviewDate?: string  // 다음 복습 예정일 (ISO 8601 형식)
  }
  timestamp: string | null
}

export interface ReviewItemSnoozeResponse {
  success: boolean
  status: number
  message: string
  data: string
  timestamp: string | null
}

/**
 * 복습 항목 완료 처리
 * @param reviewId 복습 ID
 * @param reviewItemId 복습 항목 ID
 * @param response 사용자가 선택한 응답 타입 (EASY, NORMAL, DIFFICULT, FORGOT)
 */
export async function completeReviewItem(
  reviewId: number,
  reviewItemId: number,
  response: ReviewResponseType = "NORMAL"
): Promise<ReviewItemSuccessResponse> {
  const session = await getSession()
  
  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
  }

  const url = `${API_BASE_URL}/api/v1/reviews/${reviewId}/items/${reviewItemId}/complete`
  const body = JSON.stringify({ response })

  console.log('[completeReviewItem] URL:', url)
  console.log('[completeReviewItem] Body:', body)
  console.log('[completeReviewItem] Response value:', response)

  const fetchResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: body,
  })

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text().catch(() => '')
    console.error('[completeReviewItem] Error response:', errorText)
    throw new Error(`API 요청 실패 (${fetchResponse.status}): ${errorText}`)
  }

  const data = await fetchResponse.json()
  return data as ReviewItemSuccessResponse
}

/**
 * 복습 항목 연기 처리
 * @param reviewId 복습 ID
 * @param reviewItemId 복습 항목 ID
 */
export async function snoozeReviewItem(reviewId: number, reviewItemId: number): Promise<ReviewItemSnoozeResponse> {
  const session = await getSession()
  
  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
  }

  const url = `${API_BASE_URL}/api/v1/reviews/items/${reviewItemId}/snooze`

  console.log('[snoozeReviewItem] URL:', url)

  const fetchResponse = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
  })

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text().catch(() => '')
    console.error('[snoozeReviewItem] Error response:', errorText)
    throw new Error(`API 요청 실패 (${fetchResponse.status}): ${errorText}`)
  }

  const data = await fetchResponse.json()
  return data as ReviewItemSnoozeResponse
}

