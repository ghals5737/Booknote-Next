"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useNextAuth() {
  const { data: session, status } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)
  const [storedUserId, setStoredUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "loading") {
      setIsInitialized(true)
    }
  }, [status])

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('bn_user_id') : null
      if (saved) setStoredUserId(saved)
    } catch (_) {
      // ignore localStorage errors
    }
  }, [isInitialized])

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (!result) {
      throw new Error("로그인에 실패했습니다.")
    }
    if (result.error) {
      throw new Error(result.error)
    }
    // 성공 시 이동
    window.location.href = "/books"
  }

  const loginWithProvider = async (provider: "google" | "github" | "kakao" | "naver") => {
    try {
      if (provider === "google") {
        await signIn("google", { callbackUrl: "/books" })
      } else {
        throw new Error(`${provider} 로그인은 아직 지원하지 않습니다.`)
      }
    } catch (error) {
      console.error("로그인 오류:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(text || '회원가입 요청에 실패했습니다.')
    }

    // 서버에서 반환된 사용자 ID를 저장하여 이후 요청에서 사용
    try {
      const json = await response.json()
      const newUserId = json?.data?.id ?? json?.id
      if (newUserId != null) {
        window.localStorage.setItem('bn_user_id', String(newUserId))
        setStoredUserId(String(newUserId))
      }
    } catch (_) {
      // JSON 파싱 실패는 무시하고 진행
    }

    // 가입 완료 후 로그인 페이지로 이동
    window.location.href = '/auth'
  }

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/auth" })
    } catch (error) {
      console.error("로그아웃 오류:", error)
      throw error
    }
  }

  const resetPassword = async (_email: string) => {
    // 별도 비밀번호 재설정 API 없음
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  return {
    user: session?.user
      ? { ...session.user, id: (storedUserId ?? session.user.id) as string }
      : null,
    isLoading: status === "loading" || !isInitialized,
    isAuthenticated: status === "authenticated",
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }
} 