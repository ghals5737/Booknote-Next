"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { getStoredTokens, storeTokens, clearTokens, getUserIdFromToken, isTokenExpired } from "@/lib/api/token"

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const result = await response.json();
      const tokens = result.data;
      
      // 토큰 저장
      storeTokens(tokens);
      
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      console.log('회원가입 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('회원가입 오류 응답:', errorData);
        
        // 더 구체적인 오류 메시지 제공
        let errorMessage = '회원가입에 실패했습니다.';
        if (response.status === 400) {
          errorMessage = errorData.message || '입력 정보를 확인해주세요.';
        } else if (response.status === 409) {
          errorMessage = '이미 존재하는 이메일입니다.';
        } else if (response.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (response.status === 0) {
          errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('회원가입 성공:', result);
      
      const tokens = result.data;
      
      // 토큰 저장
      storeTokens(tokens);

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
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
              'Content-Type': 'application/json',
            },
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
    // 토큰에서 사용자 ID 추출
    const tokenUserId = getUserIdFromToken();
    if (tokenUserId) return tokenUserId;
    
    // 토큰이 없거나 만료된 경우 기존 방식 사용
    const userId = storedUserId ?? session?.user?.id;
    if (!userId) return null;
    
    // 이미 숫자인 경우 그대로 반환
    if (/^\d+$/.test(userId)) return userId;
    
    // 이메일인 경우 해시를 생성하여 숫자로 변환
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return Math.abs(hash).toString();
  };

  // 토큰 기반 인증 상태 확인
  const isTokenAuthenticated = (): boolean => {
    if (!isClient) return false;
    const tokens = getStoredTokens();
    return !!(tokens?.accessToken && !isTokenExpired());
  };

  return {
    user: session?.user
      ? { ...session.user, id: getUserId() }
      : null,
    isLoading: status === "loading" || !isInitialized,
    isAuthenticated: status === "authenticated" || isTokenAuthenticated(),
    login,
    loginWithProvider,
    register,
    logout,
    resetPassword,
  }
} 