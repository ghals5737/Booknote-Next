import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
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
      ...(search && { search }),
      ...(category && { category }),
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books?${queryParams.toString()}`;
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
      return NextResponse.json(
        { success: false, message: 'Failed to fetch books', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Books proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books`;
    console.log('[proxy] POST books ->', upstreamUrl, body);

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
      console.error('[proxy] books upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to create book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books POST proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Books POST proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }
    const body = await request.json().catch(() => ({}));

    

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books`;
    console.log('[proxy] PUT books ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] books PUT upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books PUT proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Books PUT proxy error' },
      { status: 500 }
    );
  }
}