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

    // 테스트 토큰인 경우 테스트 알림 설정 반환
    if (authHeader.includes('test-access-token')) {
      return NextResponse.json({
        success: true,
        data: {
          id: 1,
          enabledYn: 'Y',
          notificationTime: '08:00:00'
        },
        status: 200,
        message: '알림 설정 조회 성공'
      });
    }

    // 백엔드 API로 프록시
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/notification`;

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
      console.error('[proxy] notification upstream 연결 실패:', error);
      return NextResponse.json(
        { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
        { status: 503 }
      );
    }

    // 서버는 항상 JSON을 반환해야 함
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] notification non-JSON response:', {
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
          { success: false, message: errorData.message || 'Failed to fetch notification settings' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: 'Failed to fetch notification settings' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Notification GET proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Notification proxy error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (error) {
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
          id: 1,
          enabledYn: body.enabledYn || 'Y',
          notificationTime: body.notificationTime ? `${body.notificationTime.toString().padStart(2, '0')}:00:00` : '08:00:00'
        },
        status: 200,
        message: '알림 설정이 업데이트되었습니다.'
      });
    }

    // 백엔드 API로 프록시
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/notification`;

    let response: Response;
    try {
      response = await fetch(upstreamUrl, {
        method: 'PATCH',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
    } catch (error) {
      console.error('[proxy] notification update upstream 연결 실패:', error);
      return NextResponse.json(
        { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
        { status: 503 }
      );
    }

    // 서버는 항상 JSON을 반환해야 함
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] notification update non-JSON response:', {
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
          { success: false, message: errorData.message || 'Failed to update notification settings' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: 'Failed to update notification settings' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Notification PATCH proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Notification update proxy error' },
      { status: 500 }
    );
  }
}

