import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '10';

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: { books: [], totalResults: 0 } });
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/external/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;

    console.log('[proxy] external search ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      // 전달할 헤더가 있으면 추가 (예: 인증)
      headers: {
        'Content-Type': 'application/json',
      },
      // 캐싱 방지
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch external search', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] external search ok');
    return NextResponse.json(data);
  } catch (error) {
    console.error('External search proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'External search proxy error' },
      { status: 500 }
    );
  }
}


