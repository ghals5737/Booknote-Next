// 복습 관련 API 함수

import { authenticatedApiRequest } from "./nextauth-api"

export interface ReviewItemSuccessResponse {
  success: boolean
  status: number
  message: string
  data: string
  timestamp: string | null
}

export interface ReviewItemPostponeResponse {
  success: boolean
  status: number
  message: string
  data: string
  timestamp: string | null
}

/**
 * 복습 항목 완료 처리
 * @param reviewItemId 복습 항목 ID
 */
export async function completeReviewItem(reviewItemId: number): Promise<ReviewItemSuccessResponse> {
  return authenticatedApiRequest<ReviewItemSuccessResponse['data']>(
    `/api/v1/review-items/${reviewItemId}/success`,
    {
      method: 'POST',
    }
  ) as Promise<ReviewItemSuccessResponse>
}

/**
 * 복습 항목 연기 처리
 * @param reviewItemId 복습 항목 ID
 */
export async function postponeReviewItem(reviewItemId: number): Promise<ReviewItemPostponeResponse> {
  return authenticatedApiRequest<ReviewItemPostponeResponse['data']>(
    `/api/v1/review-items/${reviewItemId}/postpone`,
    {
      method: 'POST',
    }
  ) as Promise<ReviewItemPostponeResponse>
}

