// 토큰 관리 유틸리티

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// 토큰 저장/조회
export const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
  } catch (error) {
    console.error('토큰 조회 실패:', error);
  }
  
  return null;
};

export const storeTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // localStorage에 저장
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // localStorage 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('bn_user_id');
    
    // 중복 저장된 카멜케이스 토큰들도 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
};

// Authorization 헤더 생성
export const getAuthHeader = (): string | null => {
  const tokens = getStoredTokens();
  return tokens ? `Bearer ${tokens.accessToken}` : null;
};

// 토큰에서 사용자 ID 추출 (JWT 파싱)
export const getUserIdFromToken = (): string | null => {
  const tokens = getStoredTokens();
  //console.log('[getUserIdFromToken] Stored tokens:', tokens);
  
  if (!tokens?.accessToken) {
    //console.log('[getUserIdFromToken] No access token found');
    return null;
  }
  
  try {
    // JWT 토큰 파싱 (Base64 디코딩)
    const tokenParts = tokens.accessToken.split('.');
   // console.log('[getUserIdFromToken] Token parts count:', tokenParts.length);
    
    if (tokenParts.length !== 3) {
      //console.error('[getUserIdFromToken] Invalid JWT format');
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const preferred = payload.sub ?? payload.userId ?? payload.uid;
    const userId = preferred != null ? String(preferred) : null;
    return userId;
  } catch (error) {
    console.error('[getUserIdFromToken] 토큰 파싱 실패:', error);
    return null;
  }
};

// 토큰 만료 확인
export const isTokenExpired = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens?.accessToken) return true;
  
  try {
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    const exp = payload.exp * 1000; // 초를 밀리초로 변환
    return Date.now() >= exp;
  } catch (error) {
    console.error('토큰 만료 확인 실패:', error);
    return true;
  }
};

// 중복 토큰 정리 함수 (애플리케이션 시작 시 호출)
export const cleanupDuplicateTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 카멜케이스 토큰이 있으면 언더스코어 토큰으로 마이그레이션 후 제거
    const camelCaseAccessToken = localStorage.getItem('accessToken');
    const camelCaseRefreshToken = localStorage.getItem('refreshToken');
    
    if (camelCaseAccessToken && camelCaseRefreshToken) {
      //console.log('중복 토큰 발견 - 통일된 형식으로 마이그레이션 중...');
      
      // 언더스코어 형식으로 저장
      localStorage.setItem('access_token', camelCaseAccessToken);
      localStorage.setItem('refresh_token', camelCaseRefreshToken);
      
      // 카멜케이스 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      console.log('토큰 마이그레이션 완료');
    }
  } catch (error) {
    console.error('토큰 정리 실패:', error);
  }
};
