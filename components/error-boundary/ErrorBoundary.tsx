"use client"

import { ErrorState } from '@/components/layout/ErrorState'
import { ErrorHandler } from '@/lib/error-handler'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: ErrorHandler.generateErrorId()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
      errorId: ErrorHandler.generateErrorId()
    })

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: 에러 리포팅 서비스 연동 (Sentry, LogRocket 등)
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: {
      //     component: 'ErrorBoundary',
      //     errorId: this.state.errorId
      //   }
      // })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 UI 렌더링
      const errorKind = ErrorHandler.getErrorKind(this.state.error)
      const errorMessage = ErrorHandler.extractErrorMessage(this.state.error)

      return (
        <ErrorState
          kind={errorKind}
          title="앱에서 오류가 발생했어요"
          description={errorMessage}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          extra={
            process.env.NODE_ENV === 'development' && this.state.errorInfo ? (
              <div className="p-6 pt-0">
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium mb-2">
                    개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>에러:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    <div>
                      <strong>컴포넌트 스택:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            ) : null
          }
        />
      )
    }

    return this.props.children
  }
}

// 함수형 컴포넌트용 에러 바운더리 훅
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled error:', error, errorInfo)
    }

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: 에러 리포팅 서비스 연동
    }
  }
}
