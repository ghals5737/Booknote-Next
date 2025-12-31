import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      const body = await request.json().catch(() => ({}));
      
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, message: 'Authorization header with Bearer token is required' },
          { status: 401 }
        );
      }
      const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes`;
      console.log('[proxy] POST quote ->', upstreamUrl, body);
  
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
        console.error('[proxy] quotes upstream error', response.status, text);
        
        // 백엔드 응답이 JSON인 경우 파싱 시도
        let errorData: Record<string, unknown> = { message: 'Failed to create quote', details: text };
        try {
          const parsed = JSON.parse(text) as Record<string, unknown>;
          errorData = parsed;
        } catch {
          // JSON이 아니면 텍스트를 details로 사용
          errorData = { message: 'Failed to create quote', details: text || `HTTP ${response.status}` };
        }
        
        return NextResponse.json(
          { success: false, ...errorData },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      console.error('Quotes POST proxy error:', error);
      return NextResponse.json(
        { success: false, message: 'Quotes POST proxy error' },
        { status: 500 }
      );
    }
  }

export async function DELETE(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');
      
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, message: 'Authorization header with Bearer token is required' },
          { status: 401 }
        );
      }
      const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/${id}`;
      const response = await fetch(upstreamUrl, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[proxy] quotes upstream error', response.status, text);
        return NextResponse.json(
          { success: false, message: 'Failed to delete quote', details: text },
          { status: response.status }
        );
      }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Quotes DELETE proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Quotes DELETE proxy error' },
      { status: 500 }
    );
  }
}