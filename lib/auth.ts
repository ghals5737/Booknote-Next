import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log('[NextAuth] Attempting login for:', credentials.email)
          
          // 1. Next.js API 라우트를 통해 로그인하여 토큰 받기
          const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('[NextAuth] Login response status:', loginResponse.status)

          if (!loginResponse.ok) {
            const errorText = await loginResponse.text().catch(() => '')
            console.error('Login failed:', loginResponse.status, errorText)
            return null
          }

          const loginData = await loginResponse.json()
          console.log('[NextAuth] Login response data:', loginData)
          
          if (!loginData.success || !loginData.data) {
            console.error('Login response invalid:', loginData)
            return null
          }

          const { accessToken, refreshToken } = loginData.data

          // 2. 토큰을 사용하여 사용자 정보 가져오기
          try {
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/users/profile`, {
              method: 'GET',
              headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
            })

            if (userResponse.ok) {
              const userData = await userResponse.json()
              if (userData.success && userData.data) {
                return {
                  id: userData.data.id.toString(),
                  email: userData.data.email,
                  name: userData.data.name,
                  accessToken,
                  refreshToken,
                }
              }
            }
          } catch (userError) {
            console.error('Failed to fetch user info:', userError)
          }

          // 사용자 정보를 가져오지 못한 경우 기본값 사용
          return {
            id: 'unknown',
            email: credentials.email,
            name: credentials.email.split('@')[0],
            accessToken,
            refreshToken,
          }
          
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 초기 로그인 시
      if (user) {
        const userWithTokens = user as typeof user & { accessToken?: string; refreshToken?: string };
        token.accessToken = userWithTokens.accessToken
        token.refreshToken = userWithTokens.refreshToken
        token.userId = user.id
      }
      
      // Google 로그인 시
      if (account?.provider === "google") {
        try {
          console.log('[NextAuth] Google login - token:', { email: token.email, name: token.name, googleId: token.sub, picture: token.picture })
          
          // Next.js API 라우트를 통해 Google 로그인하여 토큰 받기
          const googleResponse = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: token.email,
              name: token.name,
              googleId: token.sub,
              profileImage: token.picture,
            }),
          })

          console.log('[NextAuth] Google login response status:', googleResponse.status)

          if (!googleResponse.ok) {
            const errorText = await googleResponse.text().catch(() => '')
            console.error('Google login failed:', googleResponse.status, errorText)
            return token
          }

          const googleData = await googleResponse.json()
          console.log('[NextAuth] Google login response data:', googleData)
          
          if (googleData.success && googleData.data) {
            token.accessToken = googleData.data.accessToken
            token.refreshToken = googleData.data.refreshToken
            token.userId = googleData.data.user?.id || googleData.data.id
          }
        } catch (error) {
          console.error('Google auth error:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // 세션에 토큰 정보 추가
      if (token) {
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        //session.user.id = token.userId as string
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
  }
  
  interface User {
    id: string
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    userId?: string
  }
}
