import { NextRequest, NextResponse } from 'next/server';
import { UserBookResponsePage } from '../../../../../../lib/types/book/book';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Next.js App Router에서 path parameter를 가져오는 방법
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/v1/users/[id]/books')
    const { searchParams } = new URL(request.url);
    const { id } = params; // path parameter에서 id 가져오기
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    
    const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/users/${id}/books?page=${page}&size=${size}`);
    const data: UserBookResponsePage = await response.json();    
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('책 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '책 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}