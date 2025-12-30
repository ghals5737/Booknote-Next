// 복습 관련 API 함수

import { ReviewResponseType } from "@/app/review/types/review.types"
import { authenticatedApiRequest } from "./nextauth-api"

export interface ReviewItemSuccessResponse {
  success: boolean
  status: number
  message: string
  data: string
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
 * @param reviewItemId 복습 항목 ID
 * @param response 사용자가 선택한 응답 타입 (EASY, NORMAL, DIFFICULT, FORGOT)
 */
export async function completeReviewItem(
  reviewItemId: number,
  response: ReviewResponseType = "NORMAL"
): Promise<ReviewItemSuccessResponse> {
  return authenticatedApiRequest<ReviewItemSuccessResponse['data']>(
    `/api/v1/review-items/${reviewItemId}/success`,
    {
      method: 'POST',
      body: JSON.stringify({ response }),
    }
  ) as Promise<ReviewItemSuccessResponse>
}

/**
 * 복습 항목 연기 처리
 * @param reviewItemId 복습 항목 ID
 */
export async function snoozeReviewItem(reviewItemId: number): Promise<ReviewItemSnoozeResponse> {
  return authenticatedApiRequest<ReviewItemSnoozeResponse['data']>(
    `/api/v1/review-items/${reviewItemId}/snooze`,
    {
      method: 'POST',
    }
  ) as Promise<ReviewItemSnoozeResponse>
}

