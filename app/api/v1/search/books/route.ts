import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = searchParams.get('limit') || searchParams.get('size') || '10';

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: { books: [], totalResults: 0 } });
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/search/books?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
    console.log('[proxy] books search ->', upstreamUrl);

    const response = await fetch(upstreamUrl, { cache: 'no-store' });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] books search upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch books search', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] books search ok');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books search proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Books search proxy error' },
      { status: 500 }
    );
  }
}


