"use client"

import { authenticatedApiRequest } from '@/lib/api/auth'
import { ErrorHandler } from '@/lib/error-handler'
import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

interface SWRProviderProps {
  readonly children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          try {
            const response = await authenticatedApiRequest(url);
            return response.data;
          } catch (error: unknown) {
            // 에러 정보를 풍부하게 만들어서 전달
            const enhancedError = {
              ...(error || {}),
              url,
              timestamp: new Date().toISOString(),
              errorKind: ErrorHandler.getErrorKind(error),
              errorMessage: ErrorHandler.extractErrorMessage(error),
              errorDetails: ErrorHandler.extractErrorDetails(error),
              errorId: ErrorHandler.generateErrorId()
            };
            throw enhancedError;
          }
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error, key) => {
          // 에러 로깅
          if (process.env.NODE_ENV === 'development') {
            console.error(`SWR Error for ${key}:`, error);
          }
        },
        onErrorRetry: (error: Error, key: string, config: unknown, revalidate: (options?: { retryCount?: number }) => void, { retryCount }: { retryCount: number }) => {
          // 재시도 가능한 에러인지 확인
          if (!ErrorHandler.shouldRetry(error)) {
            return;
          }
          
          // 최대 재시도 횟수 확인
          if (retryCount >= 3) {
            return;
          }
          
          // 재시도 지연 시간 적용
          const delay = ErrorHandler.getRetryDelay(retryCount);
          setTimeout(() => revalidate({ retryCount }), delay);
        }
      }}
    >
      {children}
    </SWRConfig>
  )
} 