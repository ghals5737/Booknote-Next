import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // 테스트 토큰인 경우 테스트 사용자 정보 반환
    if (authHeader.includes('test-access-token')) {
      return NextResponse.json({
        success: true,
        data: {
          id: 1,
          email: 'ttt@ttt',
          name: '테스트 사용자'
        },
        status: 200,
        message: '사용자 정보 조회 성공'
      });
    }

    // 백엔드 API로 프록시
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/profile`;

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
      console.error('[proxy] profile upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch profile', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile GET proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Profile proxy error' },
      { status: 500 }
    );
  }
}