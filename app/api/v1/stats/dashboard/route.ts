import { NextRequest, NextResponse } from 'next/server';

// 환경변수 설정
const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '10000'); // 기본 10초

// API 경로 상수
const API_PATHS = {
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  DASHBOARD_STATS: '/api/v1/stats/dashboard'
} as const;

// 에러 메시지 상수
const ERROR_MESSAGES = {
  NO_API_URL: '환경변수 NEXT_PUBLIC_API_BASE_URL 이(가) 설정되지 않았습니다.',
  NO_TOKEN: '인증 토큰이 없습니다. 다시 로그인해주세요.',
  TOKEN_REFRESH_FAILED: '토큰 갱신에 실패했습니다. 다시 로그인해주세요.',
  AUTH_EXPIRED: '인증이 만료되었습니다. 다시 로그인해주세요.',
  STATS_FETCH_FAILED: '통계 데이터를 불러오는데 실패했습니다.',
  REQUEST_TIMEOUT: '요청 시간이 초과되었습니다.'
} as const;

// 목업 데이터 상수
const MOCK_DATA = {
  books: {
    total: 24,
    reading: 3,
    finished: 18,
    wishlist: 3
  },
  notes: {
    total: 156,
    important: 12,
    thisMonth: 8
  },
  quotes: {
    total: 89,
    important: 15
  },
  recentActivity: [
    {
      type: 'NOTE_CREATED',
      bookTitle: '아토믹 해빗',
      timestamp: new Date().toISOString()
    },
    {
      type: 'BOOK_ADDED',
      bookTitle: '클린 코드',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      type: 'QUOTE_ADDED',
      bookTitle: '아토믹 해빗',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ]
} as const;

// 리프레시 토큰을 사용해서 새로운 액세스 토큰 발급
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}${API_PATHS.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
}
export async function GET(request: NextRequest) {
  try {
    if (!PUBLIC_API_BASE_URL) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_API_URL },
        { status: 500 }
      );
    }

    // 요청 헤더에서 Authorization 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_TOKEN },
        { status: 401 }
      );
    }

    let accessToken = authHeader.substring(7); // 'Bearer ' 제거
    let refreshToken: string | null = null;

    // 쿠키에서 리프레시 토큰 확인 (선택적)
    const refreshTokenCookie = request.cookies.get('refresh_token')?.value;
    if (refreshTokenCookie) {
      refreshToken = refreshTokenCookie;
    }

    // 토큰 만료 확인
    const isTokenExpired = (token: string): boolean => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() >= exp;
      } catch (error) {
        console.error('토큰 파싱 실패:', error);
        return true;
      }
    };

    // 토큰이 만료된 경우 리프레시 토큰으로 갱신 시도
    if (isTokenExpired(accessToken)) {
      if (!refreshToken) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.NO_TOKEN },
          { status: 401 }
        );
      }

      const newTokens = await refreshAccessToken(refreshToken);
      if (!newTokens) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.TOKEN_REFRESH_FAILED },
          { status: 401 }
        );
      }

      accessToken = newTokens.accessToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // 백엔드 API 호출
    const response = await fetch(`${PUBLIC_API_BASE_URL}${API_PATHS.DASHBOARD_STATS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        // 401 에러가 발생하면 리프레시 토큰으로 재시도
        if (refreshToken) {
          const newTokens = await refreshAccessToken(refreshToken);
          if (newTokens) {
            // 새로운 토큰으로 재시도
            const retryResponse = await fetch(`${PUBLIC_API_BASE_URL}${API_PATHS.DASHBOARD_STATS}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newTokens.accessToken}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              cache: 'no-store',
            });

            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return NextResponse.json(data);
            }
          }
        }
        
        return NextResponse.json(
          { error: ERROR_MESSAGES.AUTH_EXPIRED },
          { status: 401 }
        );
      }
      
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || ERROR_MESSAGES.STATS_FETCH_FAILED },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('통계 API 호출 오류:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REQUEST_TIMEOUT },
        { status: 408 }
      );
    }

    // 백엔드가 없을 때 목업 데이터 반환
    return NextResponse.json({
      success: true,
      data: MOCK_DATA,
      message: '사용자 통계 정보를 성공적으로 조회했습니다.',
      timestamp: new Date().toISOString()
    });
  }
}
