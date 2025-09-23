"use client"

import { clearTokens, getStoredTokens, getUserIdFromToken, isTokenExpired, storeTokens } from "@/lib/api/token"
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useNextAuth() {
  const { data: session, status } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)
  const [storedUserId, setStoredUserId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status !== "loading") {
      setIsInitialized(true)
    }
  }, [status])

  useEffect(() => {
    if (!isClient) return
    
    try {
      const saved = window.localStorage.getItem('bn_user_id')
      if (saved) setStoredUserId(saved)
    } catch (_) {
      // ignore localStorage errors
    }
  }, [isClient, isInitialized])

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
      
      // NextAuth 세션도 업데이트 (선택사항)
      await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // 성공 시 이동
      window.location.href = "/books";
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
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
      
      // 토큰 정리
      clearTokens();
      
      // NextAuth 로그아웃
      await signOut({ callbackUrl: "/auth" });
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  }

  const resetPassword = async (_email: string) => {
    // 별도 비밀번호 재설정 API 없음
    throw new Error("비밀번호 재설정은 소셜 로그인 계정에서 직접 진행해주세요.")
  }

  // 사용자 ID를 토큰에서 가져오는 함수
  const getUserId = (): string | null => {
    // 토큰에서 직접 사용자 ID 추출 (백엔드에서 uid 클레임으로 저장)
    const tokenUserId = getUserIdFromToken();
    if (tokenUserId) {
      //console.log('[getUserId] Token에서 사용자 ID 추출:', tokenUserId);
      return tokenUserId;
    }
    
    // 토큰이 없거나 만료된 경우 세션에서 이메일 사용하여 해시 생성
    const email = session?.user?.email || storedUserId;
    if (!email) return null;
    
    //console.log('[getUserId] 세션에서 이메일 사용:', email);
    return emailToUserId(email);
  };

  // 이메일을 숫자 ID로 변환하는 함수 (백엔드와 동일한 방식)
  const emailToUserId = (email: string): string => {
    // 이메일을 해시하여 숫자 ID로 변환
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return Math.abs(hash).toString();
  };

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

  const userId = getUserId();

  return {
    user: { id: userId, email: storedUserId },
    isLoading: status === "loading" || !isInitialized,
    isAuthenticated: status === "authenticated" || isTokenAuthenticated(),
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }
} 