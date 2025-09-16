import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, name, password } = body || {};

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: 'email, name and password are required' },
        { status: 400 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/users`;
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return NextResponse.json(
        { success: false, message: 'Failed to create user', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Users proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Users proxy error' },
      { status: 500 }
    );
  }
}


