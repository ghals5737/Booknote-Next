import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/${quoteId}`;
    console.log('[proxy] GET book quote detail ->', upstreamUrl);

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
      console.error('[proxy] book quote detail upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch book quote detail', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quote detail proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quote detail proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const body = await request.json().catch(() => ({}));
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/${quoteId}`;
    console.log('[proxy] PUT book quote update ->', upstreamUrl, body);

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
      console.error('[proxy] book quote update upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book quote', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quote update proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quote update proxy error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/${quoteId}`;
    console.log('[proxy] DELETE book quote ->', upstreamUrl);

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
      console.error('[proxy] book quote delete upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to delete book quote', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quote delete proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quote delete proxy error' },
      { status: 500 }
    );
  }
}
