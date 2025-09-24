import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all'; // all, books, notes, quotes
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '10');
    const userId = searchParams.get('userId');

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

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 통합검색 API 호출
    const searchParams = new URLSearchParams({
      query,
      type,
      page: page.toString(),
      size: size.toString(),
      userId
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/unified?${searchParams}`;
    console.log('[proxy] unified search ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
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
