// 공통 토큰 갱신 유틸리티

import { getStoredTokens, isTokenExpired, storeTokens } from './token';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

// 리프레시 토큰을 사용해서 새로운 액세스 토큰 발급
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error('토큰 갱신 실패:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
}

// 토큰이 만료되었는지 확인하고 필요시 갱신
export async function ensureValidToken(): Promise<string | null> {
  const storedTokens = getStoredTokens();
  
  if (!storedTokens?.accessToken) {
    return null;
  }

  // 토큰이 만료되지 않았으면 그대로 반환
  if (!isTokenExpired()) {
    return storedTokens.accessToken;
  }

  // 토큰이 만료되었고 리프레시 토큰이 있으면 갱신 시도
  if (storedTokens.refreshToken) {
    const newTokens = await refreshAccessToken(storedTokens.refreshToken);
    if (newTokens) {
      storeTokens(newTokens);
      return newTokens.accessToken;
    }
  }

  return null;
}

// 인증이 필요한 API 요청을 위한 헬퍼 함수
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await ensureValidToken();
  
  if (!accessToken) {
    throw new Error('유효한 인증 토큰이 없습니다.');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // 401 에러가 발생하면 토큰 갱신 후 재시도
  if (response.status === 401) {
    const storedTokens = getStoredTokens();
    if (storedTokens?.refreshToken) {
      const newTokens = await refreshAccessToken(storedTokens.refreshToken);
      if (newTokens) {
        storeTokens(newTokens);
        
        // 새로운 토큰으로 재시도
        return fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newTokens.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
      }
    }
  }

  return response;
}
