import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] GET book detail ->', upstreamUrl);

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
      console.error('[proxy] book detail upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch book detail', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book detail proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book detail proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] PUT book update ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book update upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book update proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book update proxy error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] DELETE book ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book delete upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to delete book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book delete proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book delete proxy error' },
      { status: 500 }
    );
  }
}
