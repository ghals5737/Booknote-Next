import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 인증이 필요한 페이지들
    const protectedRoutes = ['/books', '/notes', '/profile', '/statistics', '/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // 인증이 필요한 페이지에 접근하는데 토큰이 없는 경우
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    // 이미 로그인된 사용자가 인증 페이지에 접근하는 경우
    if ((pathname.startsWith('/auth') || pathname.startsWith('/signup')) && token) {
      return NextResponse.redirect(new URL('/books', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // API 경로는 통과
        if (pathname.startsWith('/api/')) {
          return true
        }
        
        // 정적 파일은 통과
        if (pathname.startsWith('/_next/') || 
            pathname.includes('.') || 
            pathname.startsWith('/favicon')) {
          return true
        }
        
        // 인증 페이지는 항상 허용
        if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) {
          return true
        }
        
        // 홈페이지는 허용
        if (pathname === '/') {
          return true
        }
        
        // 다른 모든 페이지는 토큰 필요
        return !!token
      },
    },
  }
)

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: [String.raw`/((?!api|_next/static|_next/image|.*\.png$).*)`],
};