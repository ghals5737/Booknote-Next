// JWT 인증 관련 API 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  status: number;
  message: string;
}

// 토큰 관리 유틸리티 (token.ts와 통일)
export const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  },
  
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      // 통일된 토큰 키로 정리
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('bn_user_id');
      
      // 중복 저장된 카멜케이스 토큰들도 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  }
};

// API 요청 헬퍼
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API 요청 실패');
  }
  
  return data;
};

// 인증이 필요한 API 요청 헬퍼
const authenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const accessToken = tokenManager.getAccessToken();
  
  if (!accessToken) {
    throw new Error('인증 토큰이 없습니다');
  }
  
  const response = await apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  return response;
};

// 토큰 갱신 함수
const refreshAccessToken = async (): Promise<void> => {
  const refreshToken = tokenManager.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('Refresh Token이 없습니다');
  }
  
  try {
    const response = await apiRequest<TokenResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.success) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }
  } catch (error) {
    // Refresh Token도 만료된 경우
    tokenManager.clearTokens();
    throw error;
  }
};

// 자동 토큰 갱신이 포함된 인증 요청
export const authenticatedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    return await authenticatedRequest<T>(endpoint, options);
  } catch (error) {
    // 401 에러인 경우 토큰 갱신 시도
    if (error instanceof Error && error.message.includes('401')) {
      try {
        await refreshAccessToken();
        return await authenticatedRequest<T>(endpoint, options);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        throw refreshError;
      }
    }
    throw error;
  }
};

// 인증 API 함수들
export const authApi = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<ApiResponse<TokenResponse>> => {
    const response = await apiRequest<TokenResponse>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },
  
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<TokenResponse>> => {
    const response = await apiRequest<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response;
  },
  
  // 로그아웃
  logout: async (): Promise<ApiResponse<string>> => {
    const response = await authenticatedApiRequest<string>('/api/v1/auth/logout', {
      method: 'POST',
    });
    
    if (response.success) {
      tokenManager.clearTokens();
    }
    
    return response;
  },
  
  // 토큰 갱신
  refreshToken: async (): Promise<void> => {
    await refreshAccessToken();
  },
};

// 사용 예시를 위한 훅
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '로그인 실패' };
    }
  };
  
  const signup = async (email: string, name: string, password: string) => {
    try {
      const response = await authApi.signup({ email, name, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '회원가입 실패' };
    }
  };
  
  const logout = async () => {
    try {
      await authApi.logout();
      return { success: true };
    } catch (error) {
      // 로그아웃 실패해도 토큰은 클리어
      tokenManager.clearTokens();
      return { success: false, error: error instanceof Error ? error.message : '로그아웃 실패' };
    }
  };
  
  return {
    login,
    signup,
    logout,
    isAuthenticated: tokenManager.isAuthenticated(),
  };
};
