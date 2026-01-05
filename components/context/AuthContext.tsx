"use client"

import { authApi, authenticatedApiRequest, tokenManager } from "@/lib/api/auth"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "google" | "github" | "kakao" | "naver" | "email"
  createdAt: Date
  lastLoginAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: "google" | "github" | "kakao" | "naver") => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuthStatus = useCallback(async () => {
    try {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const authenticated = tokenManager.isAuthenticated()
      setIsAuthenticated(authenticated)

      if (authenticated) {
        try {
          // lib/api/auth.ts의 authenticatedApiRequest 사용
          const data = await authenticatedApiRequest<{ user: User }>('/api/v1/users/profile')
          
          if (data.success && data.data?.user) {
            const userData = data.data.user
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              avatar: (userData as unknown as Record<string, unknown>).avatar as string || (userData as unknown as Record<string, unknown>).profileImage as string,
              provider: userData.provider,
              createdAt: new Date(userData.createdAt),
              lastLoginAt: new Date(userData.lastLoginAt),
            }
            setUser(user)
          } else {
            // 토큰이 유효하지 않은 경우 제거
            setIsAuthenticated(false)
           // tokenManager.clearTokens()
          }
        } catch (apiError) {
          console.error("Profile API error:", apiError)
          setIsAuthenticated(false)
          // API 오류 시 토큰 제거
          //tokenManager.clearTokens()
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 초기 인증 상태 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      setIsAuthenticated(tokenManager.isAuthenticated())
    }
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // lib/api/auth.ts의 authApi.login 사용
      const response = await authApi.login({ email, password })
      
      if (response.success) {
        // 로그인 성공 시 인증 상태 업데이트
        if (typeof window !== 'undefined') {
          setIsAuthenticated(tokenManager.isAuthenticated())
        }
        // 로그인 후 프로필 정보 가져오기
        await checkAuthStatus()
      } else {
        throw new Error(response.message || '로그인 실패')
      }
    } catch (error) {
      console.error("Login failed:", error)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [checkAuthStatus])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loginWithProvider = useCallback(async (_provider: "google" | "github" | "kakao" | "naver") => {
    // SSO 로그인은 SSOButtons 컴포넌트에서 NextAuth의 signIn을 직접 사용합니다.
    // 이 함수는 더 이상 사용되지 않습니다.
    throw new Error("SSO 로그인은 SSOButtons 컴포넌트를 통해 처리됩니다.")
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // lib/api/auth.ts의 authApi.signup 사용
      const response = await authApi.signup({ email, password, name })
      
      if (response.success) {
        // 회원가입 성공 시 인증 상태 업데이트
        if (typeof window !== 'undefined') {
          setIsAuthenticated(tokenManager.isAuthenticated())
        }
        // 회원가입 성공 후 자동 로그인
        await checkAuthStatus()
      } else {
        throw new Error(response.message || '회원가입 실패')
      }
    } catch (error) {
      console.error("Register failed:", error)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [checkAuthStatus])

  const logout = useCallback(async () => {
    try {
      // lib/api/auth.ts의 authApi.logout 사용
      await authApi.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
      // 로그아웃 실패해도 토큰은 클리어하고 사용자 상태 초기화
      if (typeof window !== 'undefined') {
        tokenManager.clearTokens()
      }
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const resetPassword = useCallback(async () => {
    try {
      // Mock password reset - 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch {
      throw new Error("비밀번호 재설정에 실패했습니다.")
    }
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }), [user, isLoading, isAuthenticated, login, loginWithProvider, register, logout, resetPassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
