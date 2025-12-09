import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));   
    console.log('[proxy] google auth request body:', body);

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/auth/google`;
    console.log('[proxy] google auth upstream URL:', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log('[proxy] google auth upstream response status:', response.status);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] google auth upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Google login failed', details: text, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[proxy] google auth upstream response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Google auth POST proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Google auth proxy error' },
      { status: 500 }
    );
  }
}

