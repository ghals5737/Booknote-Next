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
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/notes/books/${id}?${queryParams.toString()}`;
    console.log('[proxy] GET book notes ->', upstreamUrl);

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
        console.warn('[proxy] book notes upstream error', response.status, text);
        
        // 백엔드 API가 아직 구현되지 않은 경우 Mock 데이터 반환
        if (response.status === 404 || response.status === 501) {
          console.log('[mock] Returning mock notes data for book', id);
          return NextResponse.json({
            success: true,
            data: {
              content: [
                {
                  id: 1,
                  bookId: parseInt(id),
                  title: "아토믹 해빗의 핵심 개념",
                  content: "아토믹 해빗은 작은 변화가 큰 결과를 만든다는 개념입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 것이 핵심 메시지입니다.",
                  html: "<p>아토믹 해빗은 작은 변화가 큰 결과를 만든다는 개념입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 것이 핵심 메시지입니다.</p>",
                  isImportant: true,
                  tagName: "핵심개념",
                  tagList: ["핵심개념"],
                  createdAt: "2024-12-19T10:30:00Z",
                  updatedAt: "2024-12-19T10:30:00Z"
                },
                {
                  id: 2,
                  bookId: parseInt(id),
                  title: "습관 형성의 4가지 법칙",
                  content: "1. 명확하게 하기 2. 매력적으로 만들기 3. 쉽게 만들기 4. 만족스럽게 만들기. 이 4가지 법칙이 습관 형성의 핵심입니다.",
                  html: "<p>1. 명확하게 하기<br>2. 매력적으로 만들기<br>3. 쉽게 만들기<br>4. 만족스럽게 만들기</p><p>이 4가지 법칙이 습관 형성의 핵심입니다.</p>",
                  isImportant: false,
                  tagName: "실천방법",
                  tagList: ["실천방법"],
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
          { success: false, message: 'Failed to fetch book notes', details: text },
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
              bookId: parseInt(id),
              title: "아토믹 해빗의 핵심 개념",
              content: "아토믹 해빗은 작은 변화가 큰 결과를 만든다는 개념입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 것이 핵심 메시지입니다.",
              html: "<p>아토믹 해빗은 작은 변화가 큰 결과를 만든다는 개념입니다. 1%의 개선이 연간 37배의 향상을 가져온다는 것이 핵심 메시지입니다.</p>",
              isImportant: true,
              tagName: "핵심개념",
              tagList: ["핵심개념"],
              createdAt: "2024-12-19T10:30:00Z",
              updatedAt: "2024-12-19T10:30:00Z"
            },
            {
              id: 2,
              bookId: parseInt(id),
              title: "습관 형성의 4가지 법칙",
              content: "1. 명확하게 하기 2. 매력적으로 만들기 3. 쉽게 만들기 4. 만족스럽게 만들기. 이 4가지 법칙이 습관 형성의 핵심입니다.",
              html: "<p>1. 명확하게 하기<br>2. 매력적으로 만들기<br>3. 쉽게 만들기<br>4. 만족스럽게 만들기</p><p>이 4가지 법칙이 습관 형성의 핵심입니다.</p>",
              isImportant: false,
              tagName: "실천방법",
              tagList: ["실천방법"],
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
    console.error('Book notes proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book notes proxy error' },
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
    
    // Authorization 헤더 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/notes/books/${id}`;
    console.log('[proxy] POST book note ->', upstreamUrl, body);

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
      console.error('[proxy] book note create upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to create book note', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Book note create proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Book note create proxy error' },
      { status: 500 }
    );
  }
}
