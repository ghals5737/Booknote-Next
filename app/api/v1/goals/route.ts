import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// GET: 독서 목표 조회
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
    const typeParam = searchParams.get('type');

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    if (typeParam && (typeParam === 'monthly' || typeParam === 'yearly')) {
      queryParams.append('type', typeParam);
    }

    const queryString = queryParams.toString();
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/goals${queryString ? `?${queryString}` : ''}`;

    // 백엔드 API 호출
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
    console.error('독서 목표 조회 API 호출 오류:', error);
    
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

// POST: 독서 목표 생성/수정 (Upsert)
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
    if (!body.type || !body.target || !body.year) {
      const fieldErrors = [];
      if (!body.type) fieldErrors.push({ field: 'type', error: '목표 타입은 필수입니다.' });
      if (!body.target) fieldErrors.push({ field: 'target', error: '목표 책 수는 필수입니다.' });
      if (!body.year) fieldErrors.push({ field: 'year', error: '연도는 필수입니다.' });

      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors,
        },
        { status: 400 }
      );
    }

    // 타입 검증
    if (body.type !== 'monthly' && body.type !== 'yearly') {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            { field: 'type', error: '목표 타입은 "monthly" 또는 "yearly"여야 합니다.' },
          ],
        },
        { status: 400 }
      );
    }

    // monthly일 때 month 필수 검증
    if (body.type === 'monthly' && !body.month) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            { field: 'month', error: '월간 목표일 때 월은 필수입니다.' },
          ],
        },
        { status: 400 }
      );
    }

    // target 검증 (1 이상)
    if (typeof body.target !== 'number' || body.target < 1) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            { field: 'target', error: '목표 책 수는 1 이상이어야 합니다.' },
          ],
        },
        { status: 400 }
      );
    }

    // year 검증 (현재 연도 ±1 범위)
    const currentYear = new Date().getFullYear();
    if (typeof body.year !== 'number' || body.year < currentYear - 1 || body.year > currentYear + 1) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            { field: 'year', error: '연도는 현재 연도 ±1 범위여야 합니다.' },
          ],
        },
        { status: 400 }
      );
    }

    // month 검증 (1-12, monthly일 때만)
    if (body.type === 'monthly') {
      if (typeof body.month !== 'number' || body.month < 1 || body.month > 12) {
        return NextResponse.json(
          {
            code: 'INVALID_INPUT',
            message: '잘못된 입력입니다.',
            status: 400,
            timestamp: new Date().toISOString(),
            fieldErrors: [
              { field: 'month', error: '월은 1-12 사이의 값이어야 합니다.' },
            ],
          },
          { status: 400 }
        );
      }
    }

    // 백엔드 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/goals`;
    
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
      // 400 Bad Request
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          {
            code: errorData.code || 'INVALID_INPUT',
            message: errorData.message || '잘못된 입력입니다.',
            status: 400,
            timestamp: new Date().toISOString(),
            fieldErrors: errorData.fieldErrors || [],
          },
          { status: 400 }
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
    console.error('독서 목표 생성/수정 API 호출 오류:', error);
    
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

