"use client"

import { clearTokens, getStoredTokens, getUserIdFromToken, isTokenExpired, storeTokens } from "@/lib/api/token"
import { useEffect, useState } from "react"

export function useNextAuth() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsInitialized(true)
  }, [])

  // 토큰 상태 확인
  useEffect(() => {
    if (isInitialized && isClient) {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        console.warn('토큰이 없습니다. 다시 로그인해주세요.');
      }
    }
  }, [isInitialized, isClient]);

  const login = async (email: string, password: string) => {
    try {
      const { apiPost } = await import('@/lib/api/client');
      const result = await apiPost('/api/v1/auth/login', { email, password });
      const tokens = result.data;
      
      // 토큰 저장
      storeTokens(tokens as any);

      // 성공 시 이동
      window.location.href = "/books";
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('회원가입 요청 시작:', { email, name });
      
      const { apiPost } = await import('@/lib/api/client');
      const result = await apiPost('/api/v1/auth/signup', { email, name, password });

      console.log('회원가입 성공:', result);
      
      const tokens = result.data;
      
      // 토큰 저장
      storeTokens(tokens as any);

      // 가입 완료 후 서재 페이지로 이동
      window.location.href = '/books';
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (토큰 블랙리스트 처리)
      const tokens = getStoredTokens();
      if (tokens?.accessToken) {
        try {
          const { apiPost } = await import('@/lib/api/client');
          await apiPost('/api/v1/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
            }
          });
        } catch (error) {
          console.error('백엔드 로그아웃 요청 실패:', error);
        }
      }
      
      // 토큰 정리 및 로그인 페이지로 이동
      clearTokens();
      window.location.href = '/auth';
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  }

  const resetPassword = async (_email: string) => {
    // 별도 비밀번호 재설정 API 없음
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  // 토큰에서 사용자 ID 추출
  const userId = getUserIdFromToken();

  // 토큰 기반 인증 상태 확인
  const isTokenAuthenticated = (): boolean => {
    if (!isClient) return false;
    const tokens = getStoredTokens();
    const isExpired = isTokenExpired();
    // console.log('[useNextAuth] Token check:', { 
    //   hasToken: !!tokens?.accessToken, 
    //   isExpired,
    //   tokenValue: tokens?.accessToken?.substring(0, 20) + '...'
    // });
    return !!(tokens?.accessToken && !isExpired);
  };

  return {
    user: { id: userId },
    isLoading: !isInitialized,
    isAuthenticated: isTokenAuthenticated(),
    login,
    register,
    logout,
    resetPassword,
  }
} 