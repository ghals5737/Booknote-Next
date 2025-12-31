import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '100';
    const sort = searchParams.get('sort') || 'created_at';
    
    // 세션에서 토큰 가져오기
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
      page,
      size,
      sort,
    });

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/books/${id}?${queryParams.toString()}`;
    console.log('[proxy] GET book quotes ->', upstreamUrl);

    try {
      const response = await fetch(upstreamUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const text = await response.text().catch(() => '');
        console.warn('[proxy] book quotes upstream error', response.status, text);
        
        // 백엔드 API가 아직 구현되지 않은 경우 Mock 데이터 반환
        if (response.status === 404 || response.status === 501) {
          console.log('[mock] Returning mock quotes data for book', id);
          return NextResponse.json({
            success: true,
            data: {
              content: [
                {
                  id: 1,
                  content: "작은 변화가 만드는 놀라운 결과",
                  page: 15,
                  memo: "이 문장이 이 책의 핵심 메시지인 것 같다.",
                  isImportant: true,
                  createdAt: "2024-12-19T10:30:00Z",
                  updatedAt: "2024-12-19T10:30:00Z"
                },
                {
                  id: 2,
                  content: "습관은 나쁜 것이 아니라 좋은 것을 만드는 힘이다",
                  page: 45,
                  memo: "습관에 대한 새로운 관점을 제시한다.",
                  isImportant: false,
                  createdAt: "2024-12-19T11:00:00Z",
                  updatedAt: "2024-12-19T11:00:00Z"
                }
              ],
              pageable: {
                pageNumber: 0,
                pageSize: 100,
                sort: {
                  sorted: true,
                  unsorted: false
                }
              },
              totalPages: 1,
              totalElements: 2,
              last: true,
              first: true
            }
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to fetch book quotes', details: text },
          { status: response.status }
        );
      }
    } catch (fetchError) {
      console.warn('[proxy] Backend not available, returning mock data:', fetchError);
      
      // 백엔드 서버가 실행되지 않은 경우 Mock 데이터 반환
      return NextResponse.json({
        success: true,
        data: {
          content: [
            {
              id: 1,
              content: "작은 변화가 만드는 놀라운 결과",
              page: 15,
              memo: "이 문장이 이 책의 핵심 메시지인 것 같다.",
              isImportant: true,
              createdAt: "2024-12-19T10:30:00Z",
              updatedAt: "2024-12-19T10:30:00Z"
            },
            {
              id: 2,
              content: "습관은 나쁜 것이 아니라 좋은 것을 만드는 힘이다",
              page: 45,
              memo: "습관에 대한 새로운 관점을 제시한다.",
              isImportant: false,
              createdAt: "2024-12-19T11:00:00Z",
              updatedAt: "2024-12-19T11:00:00Z"
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 100,
            sort: {
              sorted: true,
              unsorted: false
            }
          },
          totalPages: 1,
          totalElements: 2,
          last: true,
          first: true
        }
      });
    }
  } catch (error) {
    console.error('Book quotes proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quotes proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    // 세션에서 토큰 가져오기
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/quotes/books/${id}`;
    console.log('[proxy] POST book quote ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book quote create upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to create book quote', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book quote create proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book quote create proxy error' },
      { status: 500 }
    );
  }
}
