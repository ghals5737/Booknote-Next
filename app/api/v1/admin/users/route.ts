import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인 (추가 검증 로직 필요)
    // TODO: 토큰에서 사용자 역할 확인하여 관리자 권한 검증

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      page,
      size,
      ...(search && { search }),
      ...(role && { role }),
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/admin/users?${queryParams.toString()}`;
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
        { success: false, message: 'Failed to fetch users', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin users proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Admin users proxy error' },
      { status: 500 }
    );
  }
}
