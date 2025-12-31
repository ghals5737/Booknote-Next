import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9500'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/reviews/today`
    
    const upstream = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': '*/*',
      },
      cache: 'no-store',
    }).finally(() => clearTimeout(timeoutId))

    if (!upstream.ok) {
      console.error(`[API] 백엔드 응답 오류: ${upstream.status}`)
      return NextResponse.json(
        { error: '백엔드 서버 오류' },
        { status: upstream.status }
      )
    }

    const upstreamJson = await upstream.json()
    console.log(`[API] 백엔드 응답 성공:`, upstreamJson)
    
    return NextResponse.json(upstreamJson)
  } catch (error: unknown) {
    console.error('[API] 오늘의 복습 조회 실패:', error)
    return NextResponse.json(
      { error: '오늘의 복습 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

