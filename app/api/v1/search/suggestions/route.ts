import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const urlSearchParams = url.searchParams;
    const query = urlSearchParams.get('query') || '';
    const userId = urlSearchParams.get('userId');
    const limit = parseInt(urlSearchParams.get('limit') || '5');

    if (!query.trim() || query.length < 1) {
      return NextResponse.json({ 
        success: true, 
        data: { suggestions: [] } 
      });
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 자동완성 API 호출
    const searchParams = new URLSearchParams({
      query,
      userId,
      limit: limit.toString()
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/suggestions?${searchParams}`;
    console.log('[proxy] search suggestions ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] search suggestions upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: '자동완성 요청 실패', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] search suggestions ok, suggestions:', data.data?.suggestions?.length || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Search suggestions proxy error:', error);
    return NextResponse.json(
      { success: false, message: '자동완성 서버 오류' },
      { status: 500 }
    );
  }
}
