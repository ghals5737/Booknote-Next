import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'email and password are required' },
        { status: 400 }
      );
    }

    // 백엔드 로그인 API 호출
    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/auth/login`;
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { success: false, message: 'Login failed', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Login proxy error' },
      { status: 500 }
    );
  }
}
