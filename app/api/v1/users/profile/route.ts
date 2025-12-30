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

    let response: Response;
    try {
      response = await fetch(upstreamUrl, {
        method: 'GET',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch (error) {
      console.error('[proxy] profile upstream 연결 실패:', error);
      return NextResponse.json(
        { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
        { status: 503 }
      );
    }

    // 서버는 항상 JSON을 반환해야 함
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] profile non-JSON response:', {
        status: response.status,
        contentType,
        url: upstreamUrl,
        text: text.substring(0, 200)
      });
      return NextResponse.json(
        { success: false, message: '백엔드 서버가 JSON이 아닌 응답을 반환했습니다.' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { success: false, message: errorData.message || 'Failed to fetch profile' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: 'Failed to fetch profile' },
          { status: response.status }
        );
      }
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

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 테스트 토큰인 경우 테스트 응답 반환
    if (authHeader.includes('test-access-token')) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: 1,
            email: 'ttt@ttt',
            name: (body.name as string) || '테스트 사용자',
            nickname: (body.nickname as string | null) || null,
            bio: (body.bio as string | null) || null,
            profileImage: (body.profileImgUrl as string | null) || null,
            provider: 'email',
            createdAt: new Date().toISOString(),
            lastLoginAt: null
          }
        },
        status: 200,
        message: '프로필이 업데이트되었습니다.'
      });
    }

    // 백엔드 API로 프록시
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/profile`;

    let response: Response;
    try {
      response = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
    } catch (error) {
      console.error('[proxy] profile update upstream 연결 실패:', error);
      return NextResponse.json(
        { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
        { status: 503 }
      );
    }

    // 서버는 항상 JSON을 반환해야 함
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] profile update non-JSON response:', {
        status: response.status,
        contentType,
        url: upstreamUrl,
        text: text.substring(0, 200)
      });
      return NextResponse.json(
        { success: false, message: '백엔드 서버가 JSON이 아닌 응답을 반환했습니다.' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { success: false, message: errorData.message || 'Failed to update profile' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: 'Failed to update profile' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile PUT proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Profile update proxy error' },
      { status: 500 }
    );
  }
}