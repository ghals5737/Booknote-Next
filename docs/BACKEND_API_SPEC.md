# BookNote Backend API 명세서

## 📋 문서 정보

- **프로젝트명**: BookNote - 개인 독서 관리 플랫폼
- **API 버전**: v1
- **작성일**: 2024년 12월
- **작성자**: Frontend Team
- **대상**: Backend Development Team

## 🔗 기본 정보

### Base URL
```
개발 환경: http://localhost:3001/api/v1
스테이징 환경: https://api-staging.booknote.com/v1
프로덕션 환경: https://api.booknote.com/v1
```

### 공통 헤더
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>  # 인증이 필요한 API
```

### 공통 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "성공적으로 처리되었습니다.",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

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
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## 🔐 인증 API

### 1. 사용자 등록
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "홍길동",
  "profileImage": "https://example.com/avatar.jpg"  // 선택사항
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456789",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": "https://example.com/avatar.jpg",
      "provider": "email",
      "createdAt": "2024-12-19T10:30:00Z",
      "lastLoginAt": "2024-12-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "message": "회원가입이 완료되었습니다."
}
```

**검증 규칙:**
- `email`: 이메일 형식, 중복 불가
- `password`: 최소 8자, 영문/숫자/특수문자 조합
- `name`: 2-20자, 한글/영문/숫자

### 2. 로그인
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456789",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": "https://example.com/avatar.jpg",
      "provider": "email",
      "createdAt": "2024-12-19T10:30:00Z",
      "lastLoginAt": "2024-12-19T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "message": "로그인되었습니다."
}
```

### 3. 소셜 로그인
```http
POST /auth/social/{provider}
Content-Type: application/json

Request Body:
{
  "accessToken": "social_provider_access_token",
  "profile": {
    "id": "social_user_id",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImage": "https://example.com/avatar.jpg"
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

**지원하는 소셜 로그인:**
- `google`: Google OAuth 2.0
- `github`: GitHub OAuth
- `kakao`: Kakao OAuth
- `naver`: Naver OAuth

### 4. 토큰 갱신
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

### 5. 로그아웃
```http
POST /auth/logout
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

### 6. 비밀번호 재설정
```http
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "비밀번호 재설정 이메일이 발송되었습니다."
}
```

## 👤 사용자 API

### 1. 사용자 프로필 조회
```http
GET /users/profile
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456789",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": "https://example.com/avatar.jpg",
      "provider": "email",
      "createdAt": "2024-12-19T10:30:00Z",
      "lastLoginAt": "2024-12-19T10:30:00Z"
    },
    "stats": {
      "totalBooks": 25,
      "readingBooks": 3,
      "finishedBooks": 22,
      "totalNotes": 150,
      "totalQuotes": 89,
      "readingStreak": 7,
      "totalReadingTime": 120  // 시간 단위
    }
  }
}
```

### 2. 프로필 업데이트
```http
PUT /users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "name": "새로운 이름",
  "profileImage": "https://example.com/new-avatar.jpg"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  },
  "message": "프로필이 업데이트되었습니다."
}
```

### 3. 비밀번호 변경
```http
PUT /users/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!"
}

Response: 200 OK
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

## 📚 책 관리 API

### 1. 책 목록 조회
```http
GET /books?page=1&limit=20&category=자기계발&status=reading&search=아토믹
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 항목 수 (기본값: 20, 최대: 100)
- category: 카테고리 필터
- status: 상태 필터 (reading, finished, wishlist)
- search: 검색어 (제목, 저자)
- sort: 정렬 (created_at, updated_at, title, progress)

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "book_123456789",
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
        "description": "작은 변화가 만드는 놀라운 결과에 대한 책",
        "createdAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z",
        "notesCount": 5,
        "quotesCount": 12
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. 책 등록
```http
POST /books
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "title": "새로운 책",
  "author": "작가명",
  "isbn": "9788934985907",  // 선택사항
  "category": "자기계발",
  "totalPages": 300,
  "description": "책 설명",  // 선택사항
  "cover": "https://example.com/cover.jpg",  // 선택사항
  "publisher": "출판사명",  // 선택사항
  "startDate": "2024-12-19T00:00:00Z"  // 선택사항
}

Response: 201 Created
{
  "success": true,
  "data": {
    "book": { ... }
  },
  "message": "책이 등록되었습니다."
}
```

### 3. 책 상세 조회
```http
GET /books/{bookId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "book": {
      "id": "book_123456789",
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
      "updatedAt": "2024-01-15T00:00:00Z",
      "notes": [
        {
          "id": "note_123456789",
          "title": "노트 제목",
          "content": "노트 내용",
          "tags": ["태그1", "태그2"],
          "isImportant": true,
          "createdAt": "2024-01-16T00:00:00Z",
          "updatedAt": "2024-01-16T00:00:00Z"
        }
      ],
      "quotes": [
        {
          "id": "quote_123456789",
          "text": "인용구 내용",
          "page": 45,
          "chapter": "1장",
          "thoughts": "개인 생각",
          "tags": ["태그1"],
          "isImportant": true,
          "createdAt": "2024-01-17T00:00:00Z",
          "updatedAt": "2024-01-17T00:00:00Z"
        }
      ]
    }
  }
}
```

### 4. 책 정보 업데이트
```http
PUT /books/{bookId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "progress": 80,
  "currentPage": 240,
  "endDate": "2024-02-01T00:00:00Z",
  "title": "수정된 제목",  // 선택사항
  "author": "수정된 저자",  // 선택사항
  "category": "수정된 카테고리",  // 선택사항
  "description": "수정된 설명"  // 선택사항
}

Response: 200 OK
{
  "success": true,
  "data": {
    "book": { ... }
  },
  "message": "책 정보가 업데이트되었습니다."
}
```

### 5. 책 삭제
```http
DELETE /books/{bookId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "책이 삭제되었습니다."
}
```

## 📝 노트 API

### 1. 노트 목록 조회
```http
GET /books/{bookId}/notes?page=1&limit=10&tag=핵심개념&search=습관
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호
- limit: 페이지당 항목 수
- tag: 태그 필터
- search: 검색어 (제목, 내용)
- sort: 정렬 (created_at, updated_at, title)

Response: 200 OK
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note_123456789",
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

### 2. 노트 생성
```http
POST /books/{bookId}/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
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
  },
  "message": "노트가 생성되었습니다."
}
```

### 3. 노트 상세 조회
```http
GET /books/{bookId}/notes/{noteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

### 4. 노트 업데이트
```http
PUT /books/{bookId}/notes/{noteId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
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
  },
  "message": "노트가 업데이트되었습니다."
}
```

### 5. 노트 삭제
```http
DELETE /books/{bookId}/notes/{noteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "노트가 삭제되었습니다."
}
```

## 💬 인용구 API

### 1. 인용구 목록 조회
```http
GET /books/{bookId}/quotes?page=1&limit=10&tag=동기부여&search=변화
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호
- limit: 페이지당 항목 수
- tag: 태그 필터
- search: 검색어 (텍스트, 생각)
- sort: 정렬 (created_at, updated_at, page)

Response: 200 OK
{
  "success": true,
  "data": {
    "quotes": [
      {
        "id": "quote_123456789",
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

### 2. 인용구 생성
```http
POST /books/{bookId}/quotes
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
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
  },
  "message": "인용구가 생성되었습니다."
}
```

### 3. 인용구 업데이트
```http
PUT /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
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
  },
  "message": "인용구가 업데이트되었습니다."
}
```

### 4. 인용구 삭제
```http
DELETE /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "인용구가 삭제되었습니다."
}
```

## 🔍 검색 API

### 1. 통합 검색
```http
GET /search?q=아토믹&type=all&page=1&limit=20
Authorization: Bearer <jwt_token>

Query Parameters:
- q: 검색어 (필수)
- type: 검색 타입 (all, books, notes, quotes)
- page: 페이지 번호
- limit: 페이지당 항목 수

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "book_123456789",
        "title": "아토믹 해빗",
        "author": "제임스 클리어",
        "matchType": "title",
        "matchScore": 0.95
      }
    ],
    "notes": [
      {
        "id": "note_123456789",
        "title": "아토믹 습관",
        "content": "아토믹한 변화...",
        "bookTitle": "아토믹 해빗",
        "bookId": "book_123456789",
        "matchType": "content",
        "matchScore": 0.85
      }
    ],
    "quotes": [
      {
        "id": "quote_123456789",
        "text": "아토믹한 변화가...",
        "bookTitle": "아토믹 해빗",
        "bookId": "book_123456789",
        "matchType": "text",
        "matchScore": 0.90
      }
    ],
    "pagination": { ... }
  }
}
```

## 📊 통계 API

### 1. 사용자 통계
```http
GET /stats/user
Authorization: Bearer <jwt_token>

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
      "readingStreak": 7,
      "totalReadingTime": 120
    },
    "monthlyStats": [
      {
        "month": "2024-12",
        "booksRead": 5,
        "notesCreated": 25,
        "quotesSaved": 15,
        "readingTime": 20
      }
    ],
    "categoryDistribution": [
      {
        "category": "자기계발",
        "count": 10,
        "percentage": 40
      }
    ],
    "readingProgress": {
      "averageProgress": 65,
      "completionRate": 88,
      "averageReadingTime": 15
    }
  }
}
```

### 2. 독서 진행률 통계
```http
GET /stats/reading-progress
Authorization: Bearer <jwt_token>

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
    ],
    "monthlyProgress": [
      {
        "month": "2024-12",
        "averageProgress": 75,
        "booksCompleted": 3
      }
    ]
  }
}
```

## 🌐 외부 API 연동

### 1. ISBN 검색
```http
GET /external/isbn/{isbn}
Authorization: Bearer <jwt_token>

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
    "pageCount": 300,
    "language": "ko",
    "categories": ["자기계발", "습관"]
  }
}
```

### 2. 책 검색
```http
GET /external/search?q=아토믹 해빗&limit=10
Authorization: Bearer <jwt_token>

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
        "description": "책 설명",
        "publishedDate": "2020-01-01",
        "pageCount": 300
      }
    ],
    "totalResults": 15
  }
}
```

## 📁 파일 업로드 API

### 1. 이미지 업로드
```http
POST /upload/image
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- file: 이미지 파일 (jpg, png, webp, 최대 5MB)
- type: 업로드 타입 (profile, cover)

Response: 200 OK
{
  "success": true,
  "data": {
    "url": "https://cdn.booknote.com/images/user_123/profile_456.jpg",
    "filename": "profile_456.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  },
  "message": "이미지가 업로드되었습니다."
}
```

## 🔧 개발 가이드

### 데이터베이스 스키마

#### Users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  profile_image VARCHAR(500),
  provider VARCHAR(20) DEFAULT 'email',
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
```

#### Books 테이블
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

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_isbn ON books(isbn);
```

#### Notes 테이블
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

CREATE INDEX idx_notes_book_id ON notes(book_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

#### Quotes 테이블
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

CREATE INDEX idx_quotes_book_id ON quotes(book_id);
CREATE INDEX idx_quotes_tags ON quotes USING GIN(tags);
```

### JWT 토큰 설정

```javascript
// JWT 설정 예시
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',  // 액세스 토큰 7일
  refreshExpiresIn: '30d',  // 리프레시 토큰 30일
  issuer: 'booknote-api',
  audience: 'booknote-web'
}
```

### 검색 엔진 설정

```javascript
// Elasticsearch 또는 PostgreSQL Full-text Search 설정
const searchConfig = {
  // PostgreSQL Full-text Search 예시
  searchColumns: {
    books: ['title', 'author', 'description'],
    notes: ['title', 'content'],
    quotes: ['text', 'thoughts']
  },
  weights: {
    title: 'A',
    content: 'B',
    tags: 'C'
  }
}
```

### 캐싱 전략

```javascript
// Redis 캐싱 설정
const cacheConfig = {
  // 사용자 통계: 1시간
  userStats: 3600,
  // 책 목록: 30분
  bookList: 1800,
  // 검색 결과: 15분
  searchResults: 900,
  // 외부 API 결과: 1시간
  externalApi: 3600
}
```

## 🚀 배포 가이드

### 환경 변수

```bash
# 데이터베이스
DATABASE_URL=postgresql://username:password@localhost:5432/booknote

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Redis
REDIS_URL=redis://localhost:6379

# 파일 업로드
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=booknote-uploads
AWS_REGION=ap-northeast-2

# 외부 API
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

### Docker 설정

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2024-12-19T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "external_api": "available"
  }
}
```

## 📞 연락처

- **Frontend Team**: frontend@booknote.com
- **Project Manager**: pm@booknote.com
- **Technical Lead**: tech@booknote.com

---

**문서 버전**: v1.0  
**최종 업데이트**: 2024-12-19  
**다음 리뷰**: 2024-12-26 