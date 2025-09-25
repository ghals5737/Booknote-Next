# 에러 처리 가이드

BookNote 프로젝트의 향상된 에러 처리 시스템 사용 가이드입니다.

## 🚀 주요 개선사항

### 1. 통합된 에러 처리 시스템
- **Toast 알림**: 사용자 친화적인 실시간 피드백
- **에러 분류**: 자동 에러 타입 감지 및 적절한 UI 표시
- **재시도 메커니즘**: 네트워크 및 서버 에러에 대한 지능적 재시도
- **에러 바운더리**: React 컴포넌트 에러 포착 및 복구

### 2. 개발자 경험 개선
- **에러 ID**: 각 에러에 고유 ID 부여로 추적 용이
- **상세 로깅**: 개발 환경에서 풍부한 에러 정보 제공
- **타입 안전성**: TypeScript를 통한 에러 처리 타입 안전성

## 📋 사용 방법

### Toast 알림 사용하기

```tsx
import { useToastContext } from '@/components/providers/ToastProvider'

function MyComponent() {
  const { toast } = useToastContext()
  
  const handleSubmit = async () => {
    try {
      await apiCall()
      toast({
        title: '성공',
        description: '데이터가 저장되었습니다.',
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '데이터 저장에 실패했습니다.',
        variant: 'destructive'
      })
    }
  }
}
```

### 에러 핸들러 훅 사용하기

```tsx
import { useErrorHandler } from '@/hooks/use-error-handler'

function MyComponent() {
  const { handleApiError, handleFormError } = useErrorHandler()
  
  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/data')
      // 성공 처리
    } catch (error) {
      const errorInfo = handleApiError(error, '데이터 로드')
      
      if (errorInfo.shouldRetry) {
        // 재시도 로직
        setTimeout(() => handleApiCall(), 1000)
      }
    }
  }
  
  const handleFormSubmit = async (data) => {
    try {
      await submitForm(data)
    } catch (error) {
      const errorInfo = handleFormError(error, '폼 제출')
      
      if (errorInfo.fieldErrors) {
        // 필드별 에러 처리
        Object.entries(errorInfo.fieldErrors).forEach(([field, message]) => {
          setFieldError(field, message)
        })
      }
    }
  }
}
```

### 에러 바운더리 사용하기

```tsx
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 리포팅 서비스로 전송
        console.error('App Error:', error, errorInfo)
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### 커스텀 에러 상태 사용하기

```tsx
import { ErrorState } from '@/components/layout/ErrorState'

function MyErrorPage() {
  return (
    <ErrorState
      kind="not-found"
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 존재하지 않습니다."
      errorId="ERR_1234567890_abc123"
      onRetry={() => window.location.reload()}
      showHomeButton={true}
      showBackButton={true}
    />
  )
}
```

## 🎨 Toast 변형

### 사용 가능한 변형
- `default`: 기본 스타일
- `success`: 성공 메시지 (초록색)
- `warning`: 경고 메시지 (노란색)
- `destructive`: 에러 메시지 (빨간색)

### 예시
```tsx
// 성공 메시지
toast({
  title: '저장 완료',
  description: '데이터가 성공적으로 저장되었습니다.',
  variant: 'success'
})

// 경고 메시지
toast({
  title: '주의',
  description: '이 작업은 되돌릴 수 없습니다.',
  variant: 'warning'
})

// 에러 메시지
toast({
  title: '오류',
  description: '네트워크 연결을 확인해주세요.',
  variant: 'destructive'
})
```

## 🔧 에러 타입

### 자동 감지되는 에러 타입
- `network`: 네트워크 연결 문제
- `timeout`: 요청 시간 초과
- `server`: 서버 내부 오류 (5xx)
- `auth`: 인증/권한 문제 (401, 403)
- `not-found`: 리소스 없음 (404)
- `validation`: 입력 데이터 오류 (422)
- `unknown`: 기타 알 수 없는 오류

### 에러 타입별 UI
각 에러 타입에 따라 적절한 아이콘과 메시지가 자동으로 표시됩니다:

- **network**: 네트워크 아이콘, "네트워크 연결을 확인해주세요"
- **timeout**: 새로고침 아이콘, "응답이 지연되고 있어요"
- **server**: 경고 아이콘, "서버 오류가 발생했어요"
- **auth**: 경고 아이콘, "로그인이 필요해요"
- **not-found**: 지구본 아이콘, "페이지를 찾을 수 없어요"
- **validation**: 벌레 아이콘, "입력 정보를 확인해주세요"

## 🔄 재시도 메커니즘

### 자동 재시도
SWR을 통한 데이터 페칭에서 자동으로 재시도됩니다:
- 네트워크 에러
- 타임아웃 에러
- 서버 에러 (5xx)

### 지수 백오프
재시도 간격이 점진적으로 증가합니다:
- 1차 재시도: 1초 후
- 2차 재시도: 2초 후
- 3차 재시도: 4초 후
- 최대 30초까지

### 수동 재시도
```tsx
const { handleApiError } = useErrorHandler()

const retryApiCall = async () => {
  try {
    const result = await apiCall()
    return result
  } catch (error) {
    const errorInfo = handleApiError(error, 'API 호출')
    
    if (errorInfo.shouldRetry && retryCount < 3) {
      const delay = getRetryDelay(retryCount)
      setTimeout(() => retryApiCall(), delay)
      retryCount++
    }
  }
}
```

## 🎯 모범 사례

### 1. 에러 처리 우선순위
1. **사용자 친화적 메시지**: 기술적 용어보다는 이해하기 쉬운 메시지
2. **적절한 액션 제공**: 재시도, 홈으로, 뒤로가기 버튼
3. **에러 ID 제공**: 고객 지원 시 추적 가능한 ID

### 2. 로깅 전략
```tsx
// 개발 환경에서만 상세 로깅
if (process.env.NODE_ENV === 'development') {
  console.error('Detailed error info:', {
    error,
    context: 'User action',
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    userAgent: navigator.userAgent
  })
}

// 프로덕션에서는 에러 리포팅 서비스 사용
if (process.env.NODE_ENV === 'production') {
  errorReportingService.captureException(error, {
    tags: { component: 'MyComponent' },
    user: { id: getCurrentUserId() }
  })
}
```

### 3. 폼 에러 처리
```tsx
const { handleFormError } = useErrorHandler()

const handleSubmit = async (data) => {
  try {
    await submitForm(data)
    toast({ title: '저장 완료', variant: 'success' })
  } catch (error) {
    const errorInfo = handleFormError(error, '폼 제출')
    
    if (errorInfo.fieldErrors) {
      // 필드별 에러 표시
      setFieldErrors(errorInfo.fieldErrors)
    } else {
      // 일반 에러 표시
      toast({
        title: '제출 실패',
        description: errorInfo.message,
        variant: 'destructive'
      })
    }
  }
}
```

## 🚨 주의사항

### 1. 에러 바운더리 위치
- 최상위 레벨에 배치하여 전체 앱을 보호
- 특정 컴포넌트 그룹에 배치하여 부분적 복구 가능

### 2. 메모리 누수 방지
- Toast는 자동으로 5초 후 제거
- 에러 바운더리에서 컴포넌트 언마운트 시 정리 작업 수행

### 3. 성능 고려사항
- 에러 로깅은 비동기적으로 처리
- 재시도 로직에서 무한 루프 방지
- 에러 정보 캐싱으로 중복 처리 방지

## 🔧 설정 및 커스터마이징

### Toast 설정 변경
```tsx
// hooks/use-toast.ts에서 설정 변경 가능
const TOAST_DURATION = 5000 // 5초
const MAX_TOASTS = 5 // 최대 5개까지 표시
```

### 에러 리포팅 서비스 연동
```tsx
// lib/error-handler.ts에서 설정
if (process.env.NODE_ENV === 'production') {
  // Sentry, LogRocket 등 연동
  Sentry.captureException(error, {
    tags: { component: 'ErrorBoundary' },
    extra: errorInfo
  })
}
```

이제 BookNote 앱에서 일관되고 사용자 친화적인 에러 처리를 경험할 수 있습니다! 🎉
