import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }
    const body = await request.json().catch(() => ({}));    

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/user-books`;
      console.log('[proxy] POST notes ->', upstreamUrl, body);
  
      const response = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
  
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[proxy] notes upstream error', response.status, text);
        return NextResponse.json(
          { success: false, message: 'Failed to add user book', details: text },
          { status: response.status }
        );
      }
  
      const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User-books proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'User-books proxy error' },
      { status: 500 }
    );
  }
}


