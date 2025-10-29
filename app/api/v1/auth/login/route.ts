import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));   
    console.log('[proxy] login request body:', body);

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/auth/login`;
    console.log('[proxy] login upstream URL:', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log('[proxy] login upstream response:', response);
    console.log('[proxy] login upstream response status:', response.status);
    console.log('[proxy] login upstream response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] login upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Login failed', details: text, status: response.status },
        { status: response.status }
      );
    }

    // 204 No Content인 경우 처리
    if (response.status === 204) {
      console.error('[proxy] login returned 204 No Content - login failed');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const data = await response.json();
    console.log('[proxy] login upstream response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login POST proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Login proxy error' },
      { status: 500 }
    );
  }
}