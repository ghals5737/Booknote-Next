import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Next.js App Router에서 path parameter를 가져오는 방법
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    let { id } = await params; // path parameter에서 id 가져오기
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');

    if (!PUBLIC_API_BASE_URL) {
      return NextResponse.json(
        { error: '환경변수 NEXT_PUBLIC_API_BASE_URL 이(가) 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    // id가 숫자가 아니면(email 등) 이메일로 사용자 id를 조회하여 변환
    if (!/^\d+$/.test(id)) {
      // 전체 사용자 목록을 가져와 매칭 (백엔드 스펙에 검색 파라미터가 없어 전체 조회 후 필터)
      const usersRes = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/users`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        const users = usersJson?.data ?? usersJson ?? [];
        const emailToFind = decodeURIComponent(id);
        const match = Array.isArray(users)
          ? users.find((u: any) => (u?.email || '').toLowerCase() === emailToFind.toLowerCase())
          : null;
        if (match?.id) {
          id = String(match.id);
        }
      }
    }

    const upstream = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/users/${id}/books?page=${page}&size=${size}` , {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: upstream.status });
    }

    const upstreamJson = await upstream.json();
    // 백엔드 스펙: { status, success, message, data }
    const payload = upstreamJson?.data ?? upstreamJson;

    return NextResponse.json(payload);
  } catch (error) {
    console.error('책 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '책 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}