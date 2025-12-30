import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../../../lib/auth';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string; reviewItemId: string }> }
) {
  try {
    const { reviewId, reviewItemId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 response 가져오기
    const searchParams = request.nextUrl.searchParams;
    const responseParam = searchParams.get('response');
    
    // upstream URL에 쿼리 파라미터 추가
    const upstreamUrl = new URL(`${PUBLIC_API_BASE_URL}/api/v1/reviews/${reviewId}/items/${reviewItemId}/complete`);
    if (responseParam) {
      upstreamUrl.searchParams.set('response', responseParam);
    }
    
    console.log('[proxy] PATCH reviews complete ->', upstreamUrl.toString());

    const fetchOptions: RequestInit = {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    };

    const response = await fetch(upstreamUrl.toString(), fetchOptions);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] reviews complete upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to complete review item', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reviews complete proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Reviews complete proxy error' },
      { status: 500 }
    );
  }
}

