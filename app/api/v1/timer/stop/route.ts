import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// POST: 독서 타이머 중지
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 'AUTHENTICATION_REQUIRED',
          message: '인증이 필요합니다.',
          status: 401,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Request Body 파싱
    const body = await request.json().catch(() => ({}));
    
    // 필수 필드 검증
    if (!body.timerId || typeof body.timerId !== 'number') {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            { field: 'timerId', error: '타이머 ID는 필수입니다.' },
          ],
        },
        { status: 400 }
      );
    }

    // readPages 검증 (선택사항이지만 있으면 0 이상이어야 함)
    if (body.readPages !== undefined) {
      if (typeof body.readPages !== 'number' || body.readPages < 0) {
        return NextResponse.json(
          {
            code: 'INVALID_INPUT',
            message: '잘못된 입력입니다.',
            status: 400,
            timestamp: new Date().toISOString(),
            fieldErrors: [
              { field: 'readPages', error: '읽은 페이지 수는 0 이상이어야 합니다.' },
            ],
          },
          { status: 400 }
        );
      }
    }

    // 백엔드 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/timer/stop`;
    
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      // 404 Not Found - 타이머가 없는 경우
      if (response.status === 404) {
        return NextResponse.json(
          {
            code: 'TIMER_NOT_FOUND',
            message: '타이머를 찾을 수 없습니다.',
            status: 404,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      // 401 Unauthorized
      if (response.status === 401) {
        return NextResponse.json(
          {
            code: 'AUTHENTICATION_REQUIRED',
            message: '인증이 필요합니다.',
            status: 401,
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        );
      }

      // 500 Internal Server Error
      if (response.status === 500) {
        return NextResponse.json(
          {
            code: 'INTERNAL_SERVER_ERROR',
            message: '서버 오류입니다.',
            status: 500,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      // 기타 에러
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          code: errorData.code || 'UNKNOWN_ERROR',
          message: errorData.message || '알 수 없는 오류가 발생했습니다.',
          status: response.status,
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('독서 타이머 중지 API 호출 오류:', error);
    
    return NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 오류입니다.',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

