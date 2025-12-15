import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    if (!PUBLIC_API_BASE_URL) {
      return NextResponse.json(
        { error: '환경변수 NEXT_PUBLIC_API_BASE_URL 이(가) 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const upstream = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/users/${userId}/books?page=${page}&size=${size}`, {
      signal: controller.signal,
      cache: 'no-store',
    }).finally(() => clearTimeout(timeoutId));

    if (!upstream.ok) {
      console.error(`[API] 백엔드 응답 오류: ${upstream.status}`);
      return NextResponse.json({ error: '백엔드 서버 오류' }, { status: upstream.status });
    }

    const upstreamJson = await upstream.json();
    console.log(`[API] 백엔드 응답 성공:`, upstreamJson);
    
    // 백엔드 스펙: { status, success, message, data }
    const payload = upstreamJson?.data ?? upstreamJson;

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[API] 책 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '책 목록을 불러오는데 실패했습니다.' },
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

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/user/books`;
    console.log('[proxy] PUT user/books ->', upstreamUrl, body);

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
      console.error('[proxy] user/books PUT upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User books PUT proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'User books PUT proxy error' },
      { status: 500 }
    );
  }
}

