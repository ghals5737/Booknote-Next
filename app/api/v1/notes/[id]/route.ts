import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await getServerSession(authOptions);
      const { id } = await params;
      
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, message: 'Authorization header with Bearer token is required' },
          { status: 401 }
        );
      }
      const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/notes/${id}`;
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
        console.error('[proxy] quotes upstream error', response.status, text);
        return NextResponse.json(
          { success: false, message: 'Failed to delete quote', details: text },
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