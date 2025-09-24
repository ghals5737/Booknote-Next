import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/profile`;

    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to fetch user profile', 
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Profile fetch error' },
      { status: 500 }
    );
  }
}

// 사용자 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const contentType = request.headers.get('content-type') || '';
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users/profile`;

    let response: Response;

    if (contentType.includes('multipart/form-data')) {
      // 파일 업로드 처리
      const formData = await request.formData();

      response = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type은 브라우저/환경이 자동으로 설정하도록 비워둠
        } as any,
        body: formData as any,
        cache: 'no-store',
      });
    } else {
      // JSON 처리
      const body = await request.json().catch(() => ({}));
      const { name, profileImage } = body || {};

      if (!name && !profileImage) {
        return NextResponse.json(
          { success: false, message: 'At least one field (name or profileImage) is required' },
          { status: 400 }
        );
      }

      response = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, profileImage }),
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update user profile', 
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Profile update error' },
      { status: 500 }
    );
  }
}
