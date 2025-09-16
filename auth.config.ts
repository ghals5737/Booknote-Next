import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'development-secret-key-change-in-production'),
    pages: {
        signIn: '/auth'
    },
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAuthPage = nextUrl.pathname.startsWith('/auth')
            const isSignupPage = nextUrl.pathname.startsWith('/signup')

            // 로그인 상태에서 /auth, /signup 접근 시 메인으로 리다이렉트
            if (isLoggedIn && (isAuthPage || isSignupPage)) {
                return Response.redirect(new URL('/books', nextUrl))
            }
            // 비로그인 상태에서 보호 페이지 접근 시 로그인 페이지로
            if (!isLoggedIn && !(isAuthPage || isSignupPage)) {
                return false
            }
            return true
        },
        async redirect({ url, baseUrl }) {
            try {
                const target = new URL(url)
                if (target.origin === baseUrl) return url
            } catch (_) {
                // url이 상대경로인 경우
                if (url.startsWith('/')) return `${baseUrl}${url}`
            }
            return `${baseUrl}/books`
        },
        async jwt({ token, account, user }) {
            // 최초 로그인 시
            if (account) {
                token.provider = account.provider
            }
            if (user?.id) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || session.user.id
                session.user.provider = (token.provider as string) || 'credentials'
            }
            return session
        }
    },
    providers: [],
} satisfies NextAuthConfig