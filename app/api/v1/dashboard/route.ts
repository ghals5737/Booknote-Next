import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// GET: 통합 대시보드 데이터 조회
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

    // Query Parameters 파싱
    const { searchParams } = new URL(request.url);
    const includeActivitiesParam = searchParams.get('includeActivities');
    const includeQuoteParam = searchParams.get('includeQuote');
    const includeGoalsParam = searchParams.get('includeGoals');
    const includeTimerParam = searchParams.get('includeTimer');
    const activitiesLimitParam = searchParams.get('activitiesLimit');

    // includeActivities 검증 (기본값: true)
    let includeActivities = true;
    if (includeActivitiesParam !== null) {
      includeActivities = includeActivitiesParam === 'true';
    }

    // includeQuote 검증 (기본값: true)
    let includeQuote = true;
    if (includeQuoteParam !== null) {
      includeQuote = includeQuoteParam === 'true';
    }

    // includeGoals 검증 (기본값: true)
    let includeGoals = true;
    if (includeGoalsParam !== null) {
      includeGoals = includeGoalsParam === 'true';
    }

    // includeTimer 검증 (기본값: true)
    let includeTimer = true;
    if (includeTimerParam !== null) {
      includeTimer = includeTimerParam === 'true';
    }

    // activitiesLimit 검증 (기본값: 10)
    let activitiesLimit = 10;
    if (activitiesLimitParam) {
      const parsedLimit = parseInt(activitiesLimitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        activitiesLimit = parsedLimit;
      }
    }

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      includeActivities: includeActivities.toString(),
      includeQuote: includeQuote.toString(),
      includeGoals: includeGoals.toString(),
      includeTimer: includeTimer.toString(),
      activitiesLimit: activitiesLimit.toString(),
    });

    // 백엔드 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/dashboard?${queryParams.toString()}`;
    
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
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
    console.error('통합 대시보드 데이터 API 호출 오류:', error);
    
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

