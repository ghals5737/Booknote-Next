import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../../../../../lib/auth';


const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9500';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization header with Bearer token is required' },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const upstreamUrl = `${PUBLIC_API_BASE_URL}/api/v1/user/books/${id}`;
    console.log('[proxy] PUT user book ->', upstreamUrl, body);

    const response = await fetch(upstreamUrl, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[proxy] user book update upstream error', response.status, text);
      return NextResponse.json(
        { success: false, message: 'Failed to update user book', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User book PUT proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'User book PUT proxy error' },
      { status: 500 }
    );
  }
}

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
      console.error('User book DELETE proxy error:', error);
      return NextResponse.json(
        { success: false, message: 'User book DELETE proxy error' },
        { status: 500 }
      );
    }
  }