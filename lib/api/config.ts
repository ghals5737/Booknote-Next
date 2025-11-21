import { getSafeLocalStorage } from "@/lib/utils/storage";

// 공통 API 설정
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100',
  
  // 공통 헤더
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // 타임아웃 설정 (밀리초)
  TIMEOUT: 10000,
  
  // API 엔드포인트
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      SIGNUP: '/api/v1/auth/signup',
      LOGOUT: '/api/v1/auth/logout',
      REFRESH: '/api/v1/auth/refresh',
    },
    USERS: {
      PROFILE: '/api/v1/users/profile',
      PASSWORD: '/api/v1/users/password',
      CREATE: '/api/v1/users',
    },
    BOOKS: {
      LIST: '/api/v1/books',
      DETAIL: (id: string) => `/api/v1/books/${id}`,
      NOTES: (id: string) => `/api/v1/books/${id}/notes`,
      QUOTES: (id: string) => `/api/v1/books/${id}/quotes`,
    },
    STATS: {
      DASHBOARD: '/api/v1/stats/dashboard',
    },
  },
} as const;

// 토큰 관리 유틸리티
export const tokenManager = {
  getAccessToken: () => {
    const storage = getSafeLocalStorage();
    return storage ? storage.getItem('access_token') : null;
  },
  
  getRefreshToken: () => {
    const storage = getSafeLocalStorage();
    return storage ? storage.getItem('refresh_token') : null;
  },
  
  setTokens: (accessToken: string, refreshToken: string) => {
    const storage = getSafeLocalStorage();
    if (!storage) return;
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);
  },
  
  clearTokens: () => {
    const storage = getSafeLocalStorage();
    if (!storage) return;

    storage.removeItem('access_token');
    storage.removeItem('refresh_token');
    storage.removeItem('bn_user_id');
    
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
  },
  
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  }
};

// API 요청 헬퍼
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// 인증이 필요한 API 요청 헬퍼
export const authenticatedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const accessToken = tokenManager.getAccessToken();
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다');
  }
  
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
};
