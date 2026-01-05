import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// GET: 독서 타이머 기록 조회
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
    const pageParam = searchParams.get('page');
    const sizeParam = searchParams.get('size');
    const bookIdParam = searchParams.get('bookId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // page 검증 (기본값: 0)
    let page = 0;
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage >= 0) {
        page = parsedPage;
      }
    }

    // size 검증 (기본값: 20)
    let size = 20;
    if (sizeParam) {
      const parsedSize = parseInt(sizeParam, 10);
      if (!isNaN(parsedSize) && parsedSize > 0) {
        size = parsedSize;
      }
    }

    // bookId 검증
    let bookId: number | undefined = undefined;
    if (bookIdParam) {
      const parsedBookId = parseInt(bookIdParam, 10);
      if (!isNaN(parsedBookId) && parsedBookId > 0) {
        bookId = parsedBookId;
      }
    }

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(bookId && { bookId: bookId.toString() }),
      ...(startDateParam && { startDate: startDateParam }),
      ...(endDateParam && { endDate: endDateParam }),
    });

    // 백엔드 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/timer/history?${queryParams.toString()}`;
    
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
    console.error('타이머 기록 조회 API 호출 오류:', error);
    
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

