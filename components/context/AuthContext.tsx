"use client"

import { authApi, authenticatedApiRequest, tokenManager } from "@/lib/api/auth"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // 초기 인증 상태 확인
  useEffect(() => {
    setIsHydrated(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (tokenManager.isAuthenticated()) {
        try {
          // lib/api/auth.ts의 authenticatedApiRequest 사용
          const data = await authenticatedApiRequest<{ user: any }>('/api/v1/users/profile')
          
          if (data.success && data.data?.user) {
            const userData = data.data.user
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              avatar: userData.profileImage,
              provider: userData.provider,
              createdAt: new Date(userData.createdAt),
              lastLoginAt: new Date(userData.lastLoginAt),
            }
            setUser(user)
          } else {
            // 토큰이 유효하지 않은 경우 제거
            tokenManager.clearTokens()
          }
        } catch (apiError) {
          console.error("Profile API error:", apiError)
          // API 오류 시 토큰 제거
          tokenManager.clearTokens()
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // lib/api/auth.ts의 authApi.login 사용
      const response = await authApi.login({ email, password })
      
      if (response.success) {
        // 로그인 후 프로필 정보 가져오기
        await checkAuthStatus()
      } else {
        throw new Error(response.message || '로그인 실패')
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithProvider = async (provider: "google" | "github" | "kakao" | "naver") => {
    setIsLoading(true)
    try {
      // Mock SSO login - 실제로는 OAuth 플로우
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const providerNames = {
        google: "구글",
        github: "깃허브",
        kakao: "카카오",
        naver: "네이버",
      }

      const mockUser: User = {
        id: "1",
        email: `user@${provider}.com`,
        name: `${providerNames[provider]} 사용자`,
        avatar: `/placeholder.svg?height=40&width=40&query=${provider} user avatar`,
        provider,
        createdAt: new Date("2024-01-01"),
        lastLoginAt: new Date(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("auth_token", "mock_token")
      }
      setUser(mockUser)
    } catch (error) {
      throw new Error(`${provider} 로그인에 실패했습니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // lib/api/auth.ts의 authApi.signup 사용
      const response = await authApi.signup({ email, password, name })
      
      if (response.success) {
        // 회원가입 성공 후 자동 로그인
        await checkAuthStatus()
      } else {
        throw new Error(response.message || '회원가입 실패')
      }
    } catch (error) {
      console.error("Register failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // lib/api/auth.ts의 authApi.logout 사용
      await authApi.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
      // 로그아웃 실패해도 토큰은 클리어하고 사용자 상태 초기화
      tokenManager.clearTokens()
      setUser(null)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Mock password reset - 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      throw new Error("비밀번호 재설정에 실패했습니다.")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: tokenManager.isAuthenticated(),
        login,
        loginWithProvider,
        register,
        logout,
        resetPassword,
      }}
    >
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
