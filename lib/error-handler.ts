import { useToastContext } from "@/components/providers/ToastProvider";

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
}

// 일반적인 에러 객체 타입
export interface ErrorLike {
  name?: string;
  message?: string;
  status?: number;
  statusCode?: number;
  code?: string;
  error?: {
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export class ErrorHandler {
  static getErrorKind(error: unknown): 'server' | 'network' | 'timeout' | 'auth' | 'not-found' | 'validation' | 'unknown' {
    if (!error || typeof error !== 'object') return 'unknown';
    
    const err = error as ErrorLike;
    
    // 네트워크 에러
    if (err.name === 'NetworkError' || 
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('Network request failed')) {
      return 'network';
    }
    
    // 타임아웃 에러
    if (err.name === 'TimeoutError' ||
        err.message?.toLowerCase().includes('timeout') ||
        err.message?.toLowerCase().includes('timed out')) {
      return 'timeout';
    }
    
    // HTTP 상태 코드 기반 분류
    const status = err.status || err.statusCode;
    if (status && typeof status === 'number') {
      if (status === 401) return 'auth';
      if (status === 403) return 'auth';
      if (status === 404) return 'not-found';
      if (status === 422) return 'validation';
      if (status >= 500) return 'server';
      if (status >= 400) return 'validation';
    }
    
    // API 응답 에러 코드 기반 분류
    if (err.code) {
      switch (err.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return 'auth';
        case 'NOT_FOUND':
          return 'not-found';
        case 'VALIDATION_ERROR':
          return 'validation';
        case 'INTERNAL_ERROR':
          return 'server';
        default:
          return 'server';
      }
    }
    
    return 'unknown';
  }
  
  static extractErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') return '알 수 없는 오류가 발생했습니다.';
    
    const err = error as ErrorLike;
    
    // API 응답 에러 메시지
    if (err.error?.message) {
      return err.error.message;
    }
    
    // 일반 에러 메시지
    if (err.message) {
      return err.message;
    }
    
    // 상태 코드 기반 메시지
    const status = err.status || err.statusCode;
    if (status && typeof status === 'number') {
      switch (status) {
        case 400:
          return '잘못된 요청입니다.';
        case 401:
          return '로그인이 필요합니다.';
        case 403:
          return '접근 권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 422:
          return '입력 데이터가 올바르지 않습니다.';
        case 500:
          return '서버 내부 오류가 발생했습니다.';
        case 503:
          return '서비스를 일시적으로 사용할 수 없습니다.';
        default:
          return `HTTP ${status} 오류가 발생했습니다.`;
      }
    }
    
    return '알 수 없는 오류가 발생했습니다.';
  }
  
  static extractErrorDetails(error: unknown): Array<{ field: string; message: string }> | undefined {
    if (!error || typeof error !== 'object') return undefined;
    
    const err = error as ErrorLike;
    if (err.error?.details && Array.isArray(err.error.details)) {
      return err.error.details;
    }
    return undefined;
  }
  
  static generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  static shouldRetry(error: unknown): boolean {
    const kind = this.getErrorKind(error);
    return kind === 'network' || kind === 'timeout' || kind === 'server';
  }
  
  static getRetryDelay(attempt: number): number {
    // 지수 백오프: 1초, 2초, 4초, 8초...
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }
}

export function useErrorHandler() {
  const { toast } = useToastContext();
  
  const handleError = (error: unknown, context?: string) => {
    const kind = ErrorHandler.getErrorKind(error);
    const message = ErrorHandler.extractErrorMessage(error);
    const details = ErrorHandler.extractErrorDetails(error);
    const errorId = ErrorHandler.generateErrorId();
    
    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Unknown'}] Error:`, {
        error,
        kind,
        message,
        details,
        errorId
      });
    }
    
    // 사용자에게 토스트 메시지 표시
    toast({
      title: context ? `${context} 실패` : '오류 발생',
      description: message,
      variant: kind === 'validation' ? 'warning' : 'destructive'
    });
    
    // 상세 에러 정보가 있는 경우 추가 토스트
    if (details && details.length > 0) {
      const detailMessage = details.map(d => `${d.field}: ${d.message}`).join(', ');
      toast({
        title: '입력 오류 상세',
        description: detailMessage,
        variant: 'warning'
      });
    }
    
    return {
      kind,
      message,
      details,
      errorId,
      shouldRetry: ErrorHandler.shouldRetry(error)
    };
  };
  
  const handleSuccess = (message: string, context?: string) => {
    toast({
      title: context ? `${context} 완료` : '성공',
      description: message,
      variant: 'success'
    });
  };
  
  return {
    handleError,
    handleSuccess,
    shouldRetry: ErrorHandler.shouldRetry,
    getRetryDelay: ErrorHandler.getRetryDelay
  };
}
