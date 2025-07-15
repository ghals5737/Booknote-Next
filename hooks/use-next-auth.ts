"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function useNextAuth() {
  const { data: session, status } = useSession()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (_email: string, _password: string) => {
    // 이메일/비밀번호 로그인은 별도 구현 필요
    throw new Error("이메일 로그인은 지원하지 않습니다. 소셜 로그인을 사용해주세요.")
  }

  const loginWithProvider = async (provider: "google" | "github" | "kakao" | "naver") => {
    if (provider === "google") {
      await signIn("google", { callbackUrl: "/" })
    } else {
      throw new Error(`${provider} 로그인은 아직 지원하지 않습니다.`)
    }
  }

  const register = async (_email: string, _password: string, _name: string) => {
    // 회원가입은 별도 구현 필요
    throw new Error("회원가입은 소셜 로그인을 통해 진행됩니다.")
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  const resetPassword = async (_email: string) => {
    // 비밀번호 재설정은 별도 구현 필요
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }
} 