import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
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

    // 백엔드 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/dashboard/quote-of-the-day`;
    
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // 404 Not Found - 인용구가 없는 경우
      if (response.status === 404) {
        return NextResponse.json(
          {
            code: 'QUOTE_NOT_FOUND',
            message: '오늘의 인용구가 없습니다.',
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
    console.error('오늘의 인용구 API 호출 오류:', error);
    
    // 네트워크 오류 등
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

