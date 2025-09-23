// API 클라이언트 유틸리티

import { getAuthHeader, getStoredTokens } from './token';

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
      
      // 새 토큰 저장 (localStorage와 쿠키 모두)
      localStorage.setItem('access_token', newTokens.accessToken);
      localStorage.setItem('refresh_token', newTokens.refreshToken);
      
      // 쿠키에도 저장 (미들웨어에서 확인용)
      document.cookie = `access_token=${newTokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7일
      document.cookie = `refresh_token=${newTokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30일
      
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
  console.log('[apiRequest] Making request to:', url);
  
  // 기본 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 인증이 필요한 요청인 경우 토큰 추가
  if (!endpoint.includes('/auth/')) {
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('[apiRequest] Added auth header');
    } else {
      console.warn('[apiRequest] No auth header found');
    }
  }

  console.log('[apiRequest] Request options:', { method: options.method, headers });
  
  let response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('[apiRequest] Response status:', response.status);

  // 401 에러인 경우 토큰 갱신 시도
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    console.log('[apiRequest] 401 error, attempting token refresh...');
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
      console.log('[apiRequest] Retry response status:', response.status);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[apiRequest] Request failed:', response.status, errorData);
    throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
  }

  const result = await response.json();
  console.log('[apiRequest] Request successful:', result);
  return result;
};

// GET 요청
export const apiGet = <T>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { method: 'GET' });
};

// POST 요청
export const apiPost = <T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> => {
  console.log('[apiPost] Making POST request to:', endpoint, 'with data:', data);
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
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
