"use client"

import { signOut, useSession } from "next-auth/react"

export function useNextAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const isAuthenticated = !!session

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/auth" })
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

  const login = async (email: string, password: string) => {
    // 이 함수는 LoginForm에서 직접 signIn을 사용하므로 여기서는 빈 함수
    throw new Error("useNextAuth.login은 더 이상 사용되지 않습니다. LoginForm에서 직접 signIn을 사용하세요.")
  }

  const register = async (email: string, password: string, name: string) => {
    // 이 함수는 RegisterForm에서 직접 API를 호출하므로 여기서는 빈 함수
    throw new Error("useNextAuth.register은 더 이상 사용되지 않습니다. RegisterForm에서 직접 API를 호출하세요.")
  }

  const loginWithProvider = async (provider: "google" | "github" | "kakao" | "naver") => {
    // 이 함수는 SSOButtons에서 직접 signIn을 사용하므로 여기서는 빈 함수
    throw new Error("useNextAuth.loginWithProvider는 더 이상 사용되지 않습니다. SSOButtons에서 직접 signIn을 사용하세요.")
  }

  const resetPassword = async (email: string) => {
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  return {
    user: session?.user,
    isLoading,
    isAuthenticated,
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }
}
