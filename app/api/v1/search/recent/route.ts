import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// POST: 검색어 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
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

    const body = await request.json().catch(() => ({}));
    const { query, type = 'all' } = body;

    // 검증
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            {
              field: 'query',
              error: '검색어는 필수입니다.',
            },
          ],
        },
        { status: 400 }
      );
    }

    if (query.trim().length < 2 || query.length > 100) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            {
              field: 'query',
              error: '검색어는 2자 이상 100자 이하여야 합니다',
            },
          ],
        },
        { status: 400 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/recent`;
    console.log('[proxy] POST search/recent ->', upstreamUrl, { query, type });

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim(), type }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] search/recent POST upstream error', response.status, text);
      
      // 백엔드 응답이 JSON인 경우 파싱 시도
      let errorData: Record<string, unknown> = {
        code: 'SEARCH_SAVE_FAILED',
        message: '검색어 저장에 실패했습니다.',
        status: response.status,
        timestamp: new Date().toISOString(),
      };

      try {
        const parsed = JSON.parse(text);
        errorData = { ...errorData, ...parsed };
      } catch {
        errorData.details = text;
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[proxy] search/recent POST ok');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search recent POST proxy error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: '검색어 저장 중 오류가 발생했습니다.',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET: 최근 검색어 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const type = searchParams.get('type') || 'all';

    // limit 검증
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            {
              field: 'limit',
              error: 'limit는 1 이상 50 이하여야 합니다',
            },
          ],
        },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({
      limit: limitNum.toString(),
      ...(type !== 'all' && { type }),
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/recent?${queryParams}`;
    console.log('[proxy] GET search/recent ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] search/recent GET upstream error', response.status, text);
      
      let errorData: Record<string, unknown> = {
        code: 'SEARCH_FETCH_FAILED',
        message: '최근 검색어 조회에 실패했습니다.',
        status: response.status,
        timestamp: new Date().toISOString(),
      };

      try {
        const parsed = JSON.parse(text);
        errorData = { ...errorData, ...parsed };
      } catch {
        errorData.details = text;
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[proxy] search/recent GET ok, count:', data.data?.recentSearches?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search recent GET proxy error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: '최근 검색어 조회 중 오류가 발생했습니다.',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE: 전체 검색어 삭제
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
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

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/recent`;
    console.log('[proxy] DELETE search/recent (all) ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] search/recent DELETE (all) upstream error', response.status, text);
      
      let errorData: Record<string, unknown> = {
        code: 'SEARCH_DELETE_FAILED',
        message: '검색어 삭제에 실패했습니다.',
        status: response.status,
        timestamp: new Date().toISOString(),
      };

      try {
        const parsed = JSON.parse(text);
        errorData = { ...errorData, ...parsed };
      } catch {
        errorData.details = text;
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[proxy] search/recent DELETE (all) ok, deletedCount:', data.data?.deletedCount || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search recent DELETE (all) proxy error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: '검색어 삭제 중 오류가 발생했습니다.',
        status: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

