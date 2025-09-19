import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '10';

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ success: true, data: [], pagination: { page: 1, size: 10, total: 0, hasMore: false } });
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/books/autocomplete?query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
    console.log('[proxy] books autocomplete ->', upstreamUrl);

    const response = await fetch(upstreamUrl, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] books autocomplete upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch books autocomplete', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] books autocomplete ok, results:', data.data?.length || 0);
    
    // 페이지네이션 정보가 없는 경우 기본값 설정
    if (!data.pagination) {
      const pageNum = parseInt(page);
      const sizeNum = parseInt(size);
      const count = Array.isArray(data.data) ? data.data.length : 0;
      data.pagination = {
        page: pageNum,
        size: sizeNum,
        total: count,
        hasMore: count === sizeNum
      };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books autocomplete proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Books autocomplete proxy error' },
      { status: 500 }
    );
  }
}
