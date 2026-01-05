import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// DELETE: 개별 검색어 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // ID 검증
    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      return NextResponse.json(
        {
          code: 'INVALID_INPUT',
          message: '잘못된 입력입니다.',
          status: 400,
          timestamp: new Date().toISOString(),
          fieldErrors: [
            {
              field: 'id',
              error: '유효한 검색어 ID가 필요합니다',
            },
          ],
        },
        { status: 400 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/recent/${idNum}`;
    console.log('[proxy] DELETE search/recent/{id} ->', upstreamUrl);

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
      console.error('[proxy] search/recent/{id} DELETE upstream error', response.status, text);
      
      let errorData: Record<string, unknown> = {
        code: 'SEARCH_DELETE_FAILED',
        message: '검색어 삭제에 실패했습니다.',
        status: response.status,
        timestamp: new Date().toISOString(),
      };

      // 404 Not Found 처리
      if (response.status === 404) {
        errorData = {
          code: 'RECENT_SEARCH_NOT_FOUND',
          message: '검색어를 찾을 수 없습니다.',
          status: 404,
          timestamp: new Date().toISOString(),
        };
      }

      // 403 Forbidden 처리
      if (response.status === 403) {
        errorData = {
          code: 'RECENT_SEARCH_FORBIDDEN',
          message: '다른 사용자의 검색어는 삭제할 수 없습니다.',
          status: 403,
          timestamp: new Date().toISOString(),
        };
      }

      try {
        const parsed = JSON.parse(text);
        errorData = { ...errorData, ...parsed };
      } catch {
        errorData.details = text;
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[proxy] search/recent/{id} DELETE ok, id:', idNum);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search recent DELETE (id) proxy error:', error);
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

