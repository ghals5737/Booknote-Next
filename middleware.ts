import { NextRequest, NextResponse } from 'next/server';

// 토큰 기반 인증 확인 함수
function isTokenAuthenticated(request: NextRequest): boolean {
  try {
    const accessToken = request.cookies.get('access_token')?.value || 
                       request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) return false;
    
    // JWT 토큰 파싱하여 만료 확인
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API 경로는 NextAuth 미들웨어 적용하지 않음
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 정적 파일은 통과
  if (pathname.startsWith('/_next/') || 
      pathname.includes('.') || 
      pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  const isLoggedIn = !!request.cookies.get('next-auth.session-token')?.value ||
                     !!request.cookies.get('__Secure-next-auth.session-token')?.value ||
                     isTokenAuthenticated(request);
  
  const isAuthPage = pathname.startsWith('/auth');
  const isSignupPage = pathname.startsWith('/signup');
  
  // 로그인 상태에서 인증 페이지 접근 시 리다이렉트
  if (isLoggedIn && (isAuthPage || isSignupPage)) {
    return NextResponse.redirect(new URL('/books', request.url));
  }
  
  // 비로그인 상태에서 보호된 페이지 접근 시 로그인 페이지로
  if (!isLoggedIn && !(isAuthPage || isSignupPage)) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};