"use client"

import { ErrorHandler, useErrorHandler as useErrorHandlerLib } from '@/lib/error-handler'
import { useCallback } from 'react'

export function useErrorHandler() {
  const { handleError, handleSuccess, shouldRetry, getRetryDelay } = useErrorHandlerLib()

  const handleApiError = useCallback((error: any, context?: string) => {
    const errorInfo = handleError(error, context)
    
    return {
      ...errorInfo,
      retry: () => {
        if (errorInfo.shouldRetry) {
          // 재시도 로직을 여기에 구현
          return true
        }
        return false
      }
    }
  }, [handleError])

  const handleFormError = useCallback((error: any, fieldName?: string) => {
    const errorInfo = handleError(error, fieldName ? `${fieldName} 입력` : '폼 입력')
    
    // 폼 에러의 경우 더 자세한 정보 제공
    if (errorInfo.details && errorInfo.details.length > 0) {
      return {
        ...errorInfo,
        fieldErrors: errorInfo.details.reduce((acc, detail) => {
          acc[detail.field] = detail.message
          return acc
        }, {} as Record<string, string>)
      }
    }
    
    return errorInfo
  }, [handleError])

  const handleNetworkError = useCallback((error: any) => {
    const errorInfo = handleError(error, '네트워크 연결')
    
    return {
      ...errorInfo,
      isOffline: !navigator.onLine,
      retryAfter: getRetryDelay(0)
    }
  }, [handleError, getRetryDelay])

  const handleAuthError = useCallback((error: any) => {
    const errorInfo = handleError(error, '인증')
    
    return {
      ...errorInfo,
      shouldRedirectToLogin: errorInfo.kind === 'auth',
      shouldRefreshToken: error.status === 401 || error.statusCode === 401
    }
  }, [handleError])

  return {
    handleError,
    handleSuccess,
    handleApiError,
    handleFormError,
    handleNetworkError,
    handleAuthError,
    shouldRetry,
    getRetryDelay,
    // 유틸리티 함수들
    isRetryableError: ErrorHandler.shouldRetry,
    getErrorKind: ErrorHandler.getErrorKind,
    extractErrorMessage: ErrorHandler.extractErrorMessage,
    generateErrorId: ErrorHandler.generateErrorId
  }
}
