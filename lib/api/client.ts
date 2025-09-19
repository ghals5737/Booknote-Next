// API 클라이언트 유틸리티

import { getAuthHeader, getStoredTokens, isTokenExpired } from './token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// 토큰 갱신 함수
const refreshToken = async (): Promise<boolean> => {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (response.ok) {
      const result = await response.json();
      const newTokens = result.data;
      
      // 새 토큰 저장
      localStorage.setItem('access_token', newTokens.accessToken);
      localStorage.setItem('refresh_token', newTokens.refreshToken);
      
      return true;
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
  }

  return false;
};

// API 요청 함수
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 기본 헤더 설정
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 인증이 필요한 요청인 경우 토큰 추가
  if (!endpoint.includes('/auth/')) {
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 에러인 경우 토큰 갱신 시도
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // 토큰 갱신 성공 시 재시도
      const newAuthHeader = getAuthHeader();
      if (newAuthHeader) {
        headers['Authorization'] = newAuthHeader;
      }
      
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
  }

  return response.json();
};

// GET 요청
export const apiGet = <T>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

// POST 요청
export const apiPost = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PUT 요청
export const apiPut = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE 요청
export const apiDelete = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
};
