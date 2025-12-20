import { authOptions } from "@/lib/auth"
import { ReviewTodayResponse } from "@/lib/types/review/review"
import { getServerSession } from "next-auth"
import ReminderClient from "./ReminderClient"

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

export default async function ReminderPage() {
  const reviews = await getTodayReviews()
  
  return <ReminderClient reviews={reviews} />
}

