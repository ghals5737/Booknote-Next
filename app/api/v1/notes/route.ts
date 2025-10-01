import { NextRequest, NextResponse } from 'next/server';
const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
    try {
      const body = await request.json().catch(() => ({}));
      
      // Authorization 헤더 확인
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Authorization header with Bearer token is required' },
          { status: 401 }
        );
      }
  
      const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/notes`;
      console.log('[proxy] POST notes ->', upstreamUrl, body);
  
      const response = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
  
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[proxy] notes upstream error', response.status, text);
        return NextResponse.json(
          { success: false, message: 'Failed to create note', details: text },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Notes POST proxy error:', error);
      return NextResponse.json(
        { success: false, message: 'Notes POST proxy error' },
        { status: 500 }
      );
    }
  }