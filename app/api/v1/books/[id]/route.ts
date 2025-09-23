import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] GET book detail ->', upstreamUrl);

    try {
      const response = await fetch(upstreamUrl, {
        method: 'GET',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const text = await response.text().catch(() => '');
        console.warn('[proxy] book detail upstream error', response.status, text);
        
        // 백엔드 API가 아직 구현되지 않은 경우 Mock 데이터 반환
        if (response.status === 404 || response.status === 501) {
          console.log('[mock] Returning mock book detail data for book', id);
          return NextResponse.json({
            success: true,
            data: {
              id: parseInt(id),
              title: "아토믹 해빗",
              author: "제임스 클리어",
              coverImage: "https://image.yes24.com/goods/106690018/XL",
              category: "자기계발",
              progress: 75,
              currentPage: 225,
              totalPages: 300,
              rating: 5,
              isbn: "9788934985907",
              publisher: "비즈니스북스",
              description: "작은 변화가 만드는 놀라운 결과에 대한 책입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 핵심 메시지를 담고 있습니다.",
              createdAt: "2024-01-15T00:00:00Z",
              updatedAt: "2024-01-15T00:00:00Z"
            }
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to fetch book detail', details: text },
          { status: response.status }
        );
      }
    } catch (fetchError) {
      console.warn('[proxy] Backend not available, returning mock data:', fetchError);
      
      // 백엔드 서버가 실행되지 않은 경우 Mock 데이터 반환
      return NextResponse.json({
        success: true,
        data: {
          id: parseInt(id),
          title: "아토믹 해빗",
          author: "제임스 클리어",
          coverImage: "https://image.yes24.com/goods/106690018/XL",
          category: "자기계발",
          progress: 75,
          currentPage: 225,
          totalPages: 300,
          rating: 5,
          isbn: "9788934985907",
          publisher: "비즈니스북스",
          description: "작은 변화가 만드는 놀라운 결과에 대한 책입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 핵심 메시지를 담고 있습니다.",
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z"
        }
      });
    }
  } catch (error) {
    console.error('Book detail proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book detail proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] PUT book update ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book update upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book update proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book update proxy error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/books/${id}`;
    console.log('[proxy] DELETE book ->', upstreamUrl);

    const response = await fetch(upstreamUrl, {
      method: 'DELETE',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] book delete upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to delete book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book delete proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book delete proxy error' },
      { status: 500 }
    );
  }
}
