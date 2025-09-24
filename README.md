# Booknote - 개인 독서 관리 플랫폼

독서를 체계적으로 관리하고, 독서 경험을 기록하며, 지식을 체계화할 수 있는 개인 독서 관리 시스템입니다.

## 📊 프로젝트 현황

### ✅ 구현 완료된 기능

#### 🔐 인증 시스템
- ✅ 이메일/비밀번호 로그인
- ✅ 회원가입
- ✅ JWT 토큰 기반 인증
- ✅ 토큰 자동 갱신
- ✅ 로그아웃

#### 📚 서재 관리
- ✅ 책 등록 (수동 입력)
- ✅ 책 목록 조회 (그리드/리스트 뷰)
- ✅ 책 상세 정보 표시
- ✅ 책 삭제
- ✅ 책 정보 수정
- ✅ 진행률 추적
- ✅ 외부 API를 통한 책 검색 (네이버 API 연동)

#### 📝 노트 시스템
- ✅ 노트 작성 (마크다운 지원)
- ✅ 노트 목록 조회
- ✅ 노트 상세 보기
- ✅ 노트 삭제
- ✅ 태그 시스템
- ✅ 중요도 표시

#### 💬 인용구 관리
- ✅ 인용구 저장
- ✅ 페이지 번호 기록
- ✅ 개인 생각 추가
- ✅ 태그 분류

#### 📊 대시보드
- ✅ 통계 카드 표시
- ✅ 최근 노트 목록
- ✅ 빠른 작업 버튼
- ✅ 월별 통계 (UI만 구현)

#### 🎯 복습 시스템
- ✅ 플래시카드 형태의 복습 UI
- ✅ 정답/오답 추적
- ✅ 세션 통계

### ⚠️ 부분 구현된 기능

#### 📊 통계 및 분석
- ⚠️ 통계 페이지 UI 완성 (샘플 데이터 사용)
- ❌ 실제 데이터 연동 미완성
- ❌ 차트 데이터 API 연동 필요

#### 🔍 검색 기능
- ⚠️ 기본 검색 UI 구현
- ⚠️ 외부 책 검색 API 연동 완료
- ❌ 통합 검색 기능 미구현
- ❌ 고급 필터링 미구현

### ❌ 미구현 기능

#### 🔐 인증 시스템
- ❌ Google OAuth 로그인
- ❌ 비밀번호 재설정
- ❌ 이메일 인증

#### ⏰ 리마인더 시스템
- ❌ 독서 리마인더
- ❌ 목표 리마인더
- ❌ 노트 작성 리마인더

#### 📱 추가 기능
- ❌ 모바일 반응형 최적화
- ❌ 오프라인 모드
- ❌ 데이터 내보내기/가져오기
- ❌ 다크 모드

## 🔗 API 연동 상태

### ✅ 연동 완료
- `/api/v1/auth/login` - 로그인
- `/api/v1/auth/signup` - 회원가입
- `/api/v1/user/books` - 사용자 책 목록
- `/api/v1/user-books` - 책 추가/삭제
- `/api/v1/search/books` - 외부 책 검색
- `/api/v1/notes` - 노트 CRUD
- `/api/v1/quotes` - 인용구 CRUD

### ⚠️ 부분 연동
- `/api/v1/stats/dashboard` - 대시보드 통계 (Mock 데이터 사용)
- `/api/v1/books/[id]` - 책 상세 정보 (Mock 데이터 사용)

### ❌ 미연동
- `/api/v1/auth/refresh` - 토큰 갱신
- `/api/v1/auth/logout` - 로그아웃
- `/api/v1/user/profile` - 사용자 프로필
- `/api/v1/statistics/*` - 상세 통계 API
- `/api/v1/reminders/*` - 리마인더 API

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: JWT 토큰 기반 인증
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: SWR
- **Charts**: Recharts
- **Backend**: Next.js API Routes (프록시 역할)

## 🚀 개발 우선순위 TODO

### 🔥 높은 우선순위 (즉시 필요)

#### 1. 백엔드 API 완성
- [ ] **토큰 갱신 API 구현** (`/api/v1/auth/refresh`)
- [ ] **로그아웃 API 구현** (`/api/v1/auth/logout`)
- [ ] **사용자 프로필 API** (`/api/v1/user/profile`)
- [ ] **실제 통계 데이터 API** (`/api/v1/stats/dashboard`)
- [ ] **책 상세 정보 API** (`/api/v1/books/[id]`)

#### 2. 핵심 기능 완성
- [ ] **노트 편집 기능** (현재 읽기 전용)
- [ ] **인용구 편집 기능** (현재 읽기 전용)
- [ ] **책 상세 페이지 완성** (노트/인용구 표시)
- [ ] **통합 검색 기능** (책, 노트, 인용구 통합 검색)

### ⚡ 중간 우선순위 (1-2주 내)

#### 3. 사용자 경험 개선
- [ ] **모바일 반응형 최적화**
- [ ] **로딩 상태 개선** (스켈레톤 UI)
- [ ] **에러 처리 개선** (사용자 친화적 메시지)
- [ ] **성능 최적화** (이미지 최적화, 코드 분할)

#### 4. 추가 기능
- [ ] **비밀번호 재설정** 기능
- [ ] **이메일 인증** 시스템
- [ ] **데이터 내보내기/가져오기** (JSON, CSV)
- [ ] **다크 모드** 지원

### 📋 낮은 우선순위 (장기 계획)

#### 5. 고급 기능
- [ ] **Google OAuth 로그인**
- [ ] **리마인더 시스템** (독서 알림)
- [ ] **독서 목표 설정** 및 추적
- [ ] **독서 챌린지** 시스템

#### 6. 확장 기능
- [ ] **소셜 기능** (친구 추가, 독서 공유)
- [ ] **AI 기반 추천** 시스템
- [ ] **오프라인 모드** 지원
- [ ] **PWA** 지원

## 🛠️ 기술적 개선사항

### 백엔드 API 개선
- [ ] **에러 처리 표준화** (일관된 에러 응답 형식)
- [ ] **API 문서화** (Swagger/OpenAPI)
- [ ] **데이터베이스 최적화** (인덱스, 쿼리 최적화)
- [ ] **캐싱 전략** 구현 (Redis)

### 프론트엔드 개선
- [ ] **타입 안정성** 강화 (TypeScript strict 모드)
- [ ] **테스트 코드** 작성 (Jest, React Testing Library)
- [ ] **접근성** 개선 (ARIA 라벨, 키보드 네비게이션)
- [ ] **SEO 최적화** (메타 태그, 구조화된 데이터)

## 시작하기

### 1. 환경 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
BACKEND_URL=http://localhost:9100
NEXT_PUBLIC_API_URL=http://localhost:9100
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 추가 문서

- [프로젝트 기획서](./docs/PROJECT_PLAN.md)
- [API 명세서](./docs/BACKEND_API_SPEC.md)
- [컨텍스트 기반 API 명세서](./docs/CONTEXT_BASED_API_SPEC.md)
- [핵심 API 명세서](./docs/CORE_API_SPEC.md)
