import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    // 세션 확인 (다른 검색 API와 동일한 방식)
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const urlSearchParams = url.searchParams;
    const query = urlSearchParams.get('query') || '';
    const type = urlSearchParams.get('type') || 'all'; // all, books, notes, quotes
    const page = parseInt(urlSearchParams.get('page') || '1');
    const size = parseInt(urlSearchParams.get('size') || '10');


    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ 
        success: true, 
        data: {
          books: [],
          notes: [],
          quotes: [],
          suggestions: []
        },
        pagination: { 
          page, 
          size, 
          total: 0, 
          hasMore: false 
        } 
      });
    }

    // 백엔드 통합검색 API 호출
    const searchParams = new URLSearchParams({
      query,
      type,
      page: page.toString(),
      size: size.toString(),
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/unified?${searchParams}`;
    console.log('[proxy] unified search ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] unified search upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: '통합검색 요청 실패', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] unified search ok, results:', {
      books: data.data?.books?.length || 0,
      notes: data.data?.notes?.length || 0,
      quotes: data.data?.quotes?.length || 0
    });

    // 페이지네이션 정보가 없는 경우 기본값 설정
    if (!data.pagination) {
      const totalResults = (data.data?.books?.length || 0) + 
                          (data.data?.notes?.length || 0) + 
                          (data.data?.quotes?.length || 0);
      data.pagination = {
        page,
        size,
        total: totalResults,
        hasMore: totalResults === size
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unified search proxy error:', error);
    return NextResponse.json(
      { success: false, message: '통합검색 서버 오류' },
      { status: 500 }
    );
  }
}
