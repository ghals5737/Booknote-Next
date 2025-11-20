import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../lib/auth';


const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, message: 'Authorization header with Bearer token is required' },
          { status: 401 }
        );
      }
      const { id } = await params;
  
      const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/user/books/${id}`;
      console.log('[proxy] DELETE user book ->', upstreamUrl, id);
  
      const response = await fetch(upstreamUrl, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[proxy] user book delete upstream error', response.status, text);
        return NextResponse.json(
          { success: false, message: 'Failed to delete user book', details: text },
          { status: response.status }
        );
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('[API] 책 삭제 실패:', error);
      return NextResponse.json(
        { error: '책 삭제를 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }
  }