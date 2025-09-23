import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API 경로는 통과
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 정적 파일은 통과
  if (pathname.startsWith('/_next/') || 
      pathname.includes('.') || 
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // 인증 페이지는 통과
  if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }
  
  // 다른 모든 페이지는 통과 (클라이언트에서 인증 처리)
  return NextResponse.next();
}

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};