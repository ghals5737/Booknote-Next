"use client"

import { useAuth } from "@/lib/api/auth"
import { getUserIdFromToken } from "@/lib/api/token"
import { useEffect, useState } from "react"

export function useNextAuth() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { login: authLogin, logout: authLogout, signup: authSignup, isAuthenticated } = useAuth()

  useEffect(() => {
    setIsClient(true)
    setIsInitialized(true)
  }, [])

  // 토큰에서 사용자 ID 추출
  const userId = getUserIdFromToken();

  const login = async (email: string, password: string) => {
    try {
      const result = await authLogin(email, password);
      if (result.success) {
        // 성공 시 이동
        window.location.href = "/books";
      } else {
        throw new Error(result.error || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('회원가입 요청 시작:', { email, name });
      
      const result = await authSignup(email, name, password);
      if (result.success) {
        console.log('회원가입 성공:', result);
        // 가입 완료 후 서재 페이지로 이동
        window.location.href = '/books';
      } else {
        throw new Error(result.error || '회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      const result = await authLogout();
      if (result.success) {
        // 로그아웃 성공 시 로그인 페이지로 이동
        window.location.href = '/auth';
      } else {
        console.error('로그아웃 실패:', result.error);
        // 실패해도 로그인 페이지로 이동 (토큰은 이미 클리어됨)
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 에러가 발생해도 로그인 페이지로 이동
      window.location.href = '/auth';
    }
  }

  const resetPassword = async (_email: string) => {
    // 별도 비밀번호 재설정 API 없음
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  return {
    user: { id: userId },
    isLoading: !isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
  }
} 