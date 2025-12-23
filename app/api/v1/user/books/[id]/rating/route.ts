import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // 1. 서버 세션에서 토큰 가져오기 시도
    const session = await getServerSession(authOptions);
    let accessToken = session?.accessToken;

    // 2. 세션이 없으면 클라이언트에서 보낸 Authorization 헤더 확인
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    // 3. 토큰이 없으면 에러 반환
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/user/books/${id}/rating`;
    console.log('[proxy] PATCH user book rating ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] user book rating update upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book rating', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User book rating PATCH proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'User book rating PATCH proxy error' },
      { status: 500 }
    );
  }
}

