import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let body = null;
    try {
      const requestBody = await request.json();
      // body가 빈 객체가 아니고 실제 데이터가 있을 때만 사용
      if (requestBody && Object.keys(requestBody).length > 0) {
        body = requestBody;
      }
    } catch {
      // body가 없거나 파싱할 수 없으면 null 유지
      body = null;
    }
    
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/review-items/${id}/success`;
    console.log('[proxy] POST review-items success ->', upstreamUrl);

    // body가 있을 때만 body와 Content-Type 헤더를 포함
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    };

    if (body) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      };
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(upstreamUrl, fetchOptions);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] review-items success upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to complete review item', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Review-items success proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Review-items success proxy error' },
      { status: 500 }
    );
  }
}

