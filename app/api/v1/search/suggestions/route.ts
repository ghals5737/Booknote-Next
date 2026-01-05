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
    const limit = parseInt(urlSearchParams.get('limit') || '5');

    if (!query.trim() || query.length < 1) {
      return NextResponse.json({ 
        success: true, 
        data: { suggestions: [] } 
      });
    }

    // 백엔드 자동완성 API 호출
    // userId는 서버에서 세션 토큰에서 추출하므로 클라이언트에서는 보내지 않아도 됨
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString()
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/suggestions?${searchParams}`;
    console.log('[proxy] search suggestions ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
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
