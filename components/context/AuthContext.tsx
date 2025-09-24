"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
      // 클라이언트 사이드에서만 localStorage 접근
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("auth_token")
        if (token) {
          // Mock user data - 실제로는 API에서 사용자 정보 가져오기
          const mockUser: User = {
            id: "1",
            email: "user@example.com",
            name: "김독서",
            avatar: "/placeholder.svg?height=40&width=40",
            provider: "email",
            createdAt: new Date("2024-01-01"),
            lastLoginAt: new Date(),
          }
          setUser(mockUser)
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
      // Mock login - 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email,
        name: "김독서",
        avatar: "/placeholder.svg?height=40&width=40",
        provider: "email",
        createdAt: new Date("2024-01-01"),
        lastLoginAt: new Date(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("auth_token", "mock_token")
      }
      setUser(mockUser)
    } catch (error) {
      throw new Error("로그인에 실패했습니다.")
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
      // Mock register - 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "1",
        email,
        name,
        avatar: "/placeholder.svg?height=40&width=40",
        provider: "email",
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("auth_token", "mock_token")
      }
      setUser(mockUser)
    } catch (error) {
      throw new Error("회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("auth_token")
      }
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
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
        isAuthenticated: !!user,
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
