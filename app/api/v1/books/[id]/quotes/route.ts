import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '100';
    const sort = searchParams.get('sort') || 'created_at';
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      page,
      size,
      sort,
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}/quotes?${queryParams.toString()}`;
    console.log('[proxy] GET book quotes ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book quotes upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch book quotes', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quotes proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quotes proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}/quotes`;
    console.log('[proxy] POST book quote ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book quote create upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to create book quote', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quote create proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quote create proxy error' },
      { status: 500 }
    );
  }
}
