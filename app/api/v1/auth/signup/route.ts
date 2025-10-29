import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));   
    

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/auth/signup`;

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] books upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to create book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Books POST proxy error:', error);
    return NextResponse.json(
      { success: false, message: ' POST proxy error' },
      { status: 500 }
    );
  }
}