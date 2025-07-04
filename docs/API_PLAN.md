# BookNote API 개발 계획서

## 🔗 API 개요

### 기본 정보
- **Base URL**: `https://api.booknote.com/v1`
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token
- **응답 형식**: JSON

### API 버전 관리
- URL 기반 버전 관리 (`/v1`, `/v2`)
- 하위 호환성 보장
- Deprecation 정책: 6개월 전 고지

## 🔐 인증 및 권한

### 인증 방식
```typescript
// 요청 헤더
Authorization: Bearer <jwt_token>
```

### 권한 레벨
1. **Public**: 인증 불필요 (책 검색, 공개 통계)
2. **User**: 로그인 사용자 (개인 데이터 관리)
3. **Admin**: 관리자 (시스템 관리)

## 📚 API 엔드포인트 설계

### 1. 인증 API (`/auth`)

#### 1.1 사용자 등록
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "홍길동",
  "profileImage": "https://example.com/avatar.jpg"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "홍길동",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 1.2 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### 1.3 토큰 갱신
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### 2. 사용자 API (`/users`)

#### 2.1 사용자 프로필 조회
```http
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImage": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "stats": {
      "totalBooks": 25,
      "totalNotes": 150,
      "totalQuotes": 89,
      "readingStreak": 7
    }
  }
}
```

#### 2.2 프로필 업데이트
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "새로운 이름",
  "profileImage": "https://example.com/new-avatar.jpg"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### 3. 책 관리 API (`/books`)

#### 3.1 책 목록 조회
```http
GET /books?page=1&limit=20&category=자기계발&status=reading
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "book_123",
        "title": "아토믹 해빗",
        "author": "제임스 클리어",
        "cover": "https://example.com/cover.jpg",
        "category": "자기계발",
        "progress": 75,
        "currentPage": 225,
        "totalPages": 300,
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": null,
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

#### 3.2 책 등록
```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "새로운 책",
  "author": "작가명",
  "isbn": "9788934985907",
  "category": "자기계발",
  "totalPages": 300,
  "description": "책 설명",
  "cover": "https://example.com/cover.jpg"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "book": { ... }
  }
}
```

#### 3.3 책 상세 조회
```http
GET /books/{bookId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "book": {
      "id": "book_123",
      "title": "아토믹 해빗",
      "author": "제임스 클리어",
      "cover": "https://example.com/cover.jpg",
      "category": "자기계발",
      "progress": 75,
      "currentPage": 225,
      "totalPages": 300,
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": null,
      "isbn": "9788934985907",
      "publisher": "비즈니스북스",
      "description": "책 설명",
      "createdAt": "2024-01-15T00:00:00Z",
      "notes": [
        {
          "id": "note_123",
          "title": "노트 제목",
          "content": "노트 내용",
          "tags": ["태그1", "태그2"],
          "isImportant": true,
          "createdAt": "2024-01-16T00:00:00Z"
        }
      ],
      "quotes": [
        {
          "id": "quote_123",
          "text": "인용구 내용",
          "page": 45,
          "chapter": "1장",
          "thoughts": "개인 생각",
          "tags": ["태그1"],
          "isImportant": true,
          "createdAt": "2024-01-17T00:00:00Z"
        }
      ]
    }
  }
}
```

#### 3.4 책 정보 업데이트
```http
PUT /books/{bookId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 80,
  "currentPage": 240,
  "endDate": "2024-02-01T00:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "book": { ... }
  }
}
```

#### 3.5 책 삭제
```http
DELETE /books/{bookId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "책이 성공적으로 삭제되었습니다."
}
```

### 4. 노트 API (`/books/{bookId}/notes`)

#### 4.1 노트 목록 조회
```http
GET /books/{bookId}/notes?page=1&limit=10&tag=핵심개념
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note_123",
        "title": "노트 제목",
        "content": "노트 내용",
        "tags": ["태그1", "태그2"],
        "isImportant": true,
        "createdAt": "2024-01-16T00:00:00Z",
        "updatedAt": "2024-01-16T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### 4.2 노트 생성
```http
POST /books/{bookId}/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "새로운 노트",
  "content": "노트 내용",
  "tags": ["태그1", "태그2"],
  "isImportant": false
}

Response: 201 Created
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

#### 4.3 노트 상세 조회
```http
GET /books/{bookId}/notes/{noteId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

#### 4.4 노트 업데이트
```http
PUT /books/{bookId}/notes/{noteId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "tags": ["새태그1", "새태그2"],
  "isImportant": true
}

Response: 200 OK
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

#### 4.5 노트 삭제
```http
DELETE /books/{bookId}/notes/{noteId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "노트가 성공적으로 삭제되었습니다."
}
```

### 5. 인용구 API (`/books/{bookId}/quotes`)

#### 5.1 인용구 목록 조회
```http
GET /books/{bookId}/quotes?page=1&limit=10&tag=동기부여
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "quotes": [
      {
        "id": "quote_123",
        "text": "인용구 내용",
        "page": 45,
        "chapter": "1장",
        "thoughts": "개인 생각",
        "tags": ["태그1"],
        "isImportant": true,
        "createdAt": "2024-01-17T00:00:00Z",
        "updatedAt": "2024-01-17T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### 5.2 인용구 생성
```http
POST /books/{bookId}/quotes
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "새로운 인용구",
  "page": 50,
  "chapter": "2장",
  "thoughts": "개인적인 생각",
  "tags": ["태그1"],
  "isImportant": false
}

Response: 201 Created
{
  "success": true,
  "data": {
    "quote": { ... }
  }
}
```

#### 5.3 인용구 업데이트
```http
PUT /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "수정된 인용구",
  "thoughts": "수정된 생각",
  "tags": ["새태그1"],
  "isImportant": true
}

Response: 200 OK
{
  "success": true,
  "data": {
    "quote": { ... }
  }
}
```

#### 5.4 인용구 삭제
```http
DELETE /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "인용구가 성공적으로 삭제되었습니다."
}
```

### 6. 검색 API (`/search`)

#### 6.1 통합 검색
```http
GET /search?q=아토믹&type=all&page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "book_123",
        "title": "아토믹 해빗",
        "author": "제임스 클리어",
        "matchType": "title"
      }
    ],
    "notes": [
      {
        "id": "note_123",
        "title": "아토믹 습관",
        "content": "아토믹한 변화...",
        "bookTitle": "아토믹 해빗",
        "matchType": "content"
      }
    ],
    "quotes": [
      {
        "id": "quote_123",
        "text": "아토믹한 변화가...",
        "bookTitle": "아토믹 해빗",
        "matchType": "text"
      }
    ],
    "pagination": { ... }
  }
}
```

### 7. 통계 API (`/stats`)

#### 7.1 사용자 통계
```http
GET /stats/user
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "overview": {
      "totalBooks": 25,
      "readingBooks": 3,
      "finishedBooks": 22,
      "totalNotes": 150,
      "totalQuotes": 89,
      "readingStreak": 7
    },
    "monthlyStats": [
      {
        "month": "2024-01",
        "booksRead": 5,
        "notesCreated": 25,
        "quotesSaved": 15
      }
    ],
    "categoryDistribution": [
      {
        "category": "자기계발",
        "count": 10,
        "percentage": 40
      }
    ]
  }
}
```

#### 7.2 독서 진행률 통계
```http
GET /stats/reading-progress
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "averageProgress": 65,
    "completionRate": 88,
    "averageReadingTime": 15,
    "progressByCategory": [
      {
        "category": "자기계발",
        "averageProgress": 70,
        "totalBooks": 10
      }
    ]
  }
}
```

### 8. 외부 API 연동 (`/external`)

#### 8.1 ISBN 검색
```http
GET /external/isbn/{isbn}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "title": "아토믹 해빗",
    "author": "제임스 클리어",
    "publisher": "비즈니스북스",
    "isbn": "9788934985907",
    "cover": "https://example.com/cover.jpg",
    "description": "책 설명",
    "publishedDate": "2020-01-01",
    "pageCount": 300
  }
}
```

#### 8.2 책 검색
```http
GET /external/search?q=아토믹 해빗&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "title": "아토믹 해빗",
        "author": "제임스 클리어",
        "publisher": "비즈니스북스",
        "isbn": "9788934985907",
        "cover": "https://example.com/cover.jpg",
        "description": "책 설명"
      }
    ]
  }
}
```

## 📊 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  profile_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Books 테이블
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover VARCHAR(500),
  category VARCHAR(100),
  isbn VARCHAR(20),
  publisher VARCHAR(255),
  description TEXT,
  total_pages INTEGER,
  current_page INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes 테이블
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Quotes 테이블
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  chapter VARCHAR(100),
  thoughts TEXT,
  tags TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 구현 계획

### Phase 1: 기본 API (2주)
- [ ] 사용자 인증 API
- [ ] 책 CRUD API
- [ ] 기본 검증 및 에러 처리

### Phase 2: 확장 API (2주)
- [ ] 노트 CRUD API
- [ ] 인용구 CRUD API
- [ ] 검색 API

### Phase 3: 고급 기능 (2주)
- [ ] 통계 API
- [ ] 외부 API 연동
- [ ] 캐싱 및 최적화

### Phase 4: 테스트 및 문서화 (1주)
- [ ] API 테스트 작성
- [ ] API 문서화 (Swagger)
- [ ] 성능 테스트

## 🛡️ 보안 고려사항

### 인증 및 권한
- JWT 토큰 기반 인증
- 토큰 만료 시간 설정
- 리프레시 토큰 구현
- 권한 기반 접근 제어

### 데이터 보안
- 입력 데이터 검증
- SQL 인젝션 방지
- XSS 공격 방지
- CSRF 토큰 사용

### API 보안
- Rate Limiting 구현
- HTTPS 강제 사용
- CORS 정책 설정
- API 키 관리

## 📈 성능 최적화

### 캐싱 전략
- Redis를 이용한 세션 캐싱
- API 응답 캐싱
- 데이터베이스 쿼리 최적화

### 데이터베이스 최적화
- 인덱스 설정
- 쿼리 최적화
- 연결 풀 관리

### API 최적화
- 페이지네이션 구현
- 압축 응답
- CDN 활용

## 📝 에러 처리

### HTTP 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 오류

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 올바르지 않습니다.",
    "details": [
      {
        "field": "email",
        "message": "올바른 이메일 형식이 아닙니다."
      }
    ]
  }
}
```

## 🔄 API 버전 관리

### 버전 정책
- URL 기반 버전 관리 (`/v1`, `/v2`)
- 하위 호환성 보장
- Deprecation 정책: 6개월 전 고지

### 마이그레이션 가이드
- API 변경사항 문서화
- 마이그레이션 스크립트 제공
- 테스트 환경 제공 