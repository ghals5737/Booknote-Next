# BookNote 핵심 API 명세서

## 📋 문서 정보

- **프로젝트명**: BookNote - 개인 독서 관리 플랫폼
- **API 버전**: v1
- **작성일**: 2024년 12월
- **대상**: Backend Development Team
- **범위**: 책 관리, 노트 시스템, 인용구 관리

## 🔗 기본 정보

### Base URL
```
개발 환경: http://localhost:3001/api/v1
프로덕션 환경: https://api.booknote.com/v1
```

### 공통 헤더
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
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
        "field": "title",
        "message": "책 제목은 필수입니다."
      }
    ]
  },
  "timestamp": "2024-12-19T10:30:00Z"
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
- category: 카테고리 필터 (선택사항)
- status: 상태 필터 (reading, finished, wishlist) (선택사항)
- search: 검색어 (제목, 저자) (선택사항)
- sort: 정렬 (created_at, updated_at, title, progress) (기본값: updated_at)

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
    "book": {
      "id": "book_123456789",
      "title": "새로운 책",
      "author": "작가명",
      "cover": "https://example.com/cover.jpg",
      "category": "자기계발",
      "progress": 0,
      "currentPage": 0,
      "totalPages": 300,
      "startDate": "2024-12-19T00:00:00Z",
      "endDate": null,
      "isbn": "9788934985907",
      "publisher": "출판사명",
      "description": "책 설명",
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "notesCount": 0,
      "quotesCount": 0
    }
  },
  "message": "책이 등록되었습니다."
}
```

**검증 규칙:**
- `title`: 필수, 1-255자
- `author`: 필수, 1-255자
- `category`: 필수, 1-100자
- `totalPages`: 선택사항, 양의 정수
- `isbn`: 선택사항, ISBN 형식 검증
- `startDate`: 선택사항, ISO 8601 날짜 형식

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
      "notesCount": 5,
      "quotesCount": 12
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
  "description": "수정된 설명",  // 선택사항
  "totalPages": 350,  // 선택사항
  "publisher": "수정된 출판사",  // 선택사항
  "cover": "https://example.com/new-cover.jpg"  // 선택사항
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

**진행률 계산 로직:**
- `progress`가 제공되면 그 값을 사용
- `progress`가 제공되지 않으면 `(currentPage / totalPages) * 100`으로 계산
- `progress`가 100이 되면 자동으로 `endDate`를 현재 시간으로 설정

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

**주의사항:**
- 책을 삭제하면 관련된 모든 노트와 인용구도 함께 삭제됩니다.
- 삭제는 되돌릴 수 없습니다.

## 📝 노트 시스템 API

### 1. 노트 목록 조회
```http
GET /books/{bookId}/notes?page=1&limit=10&tag=핵심개념&search=습관&sort=created_at
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 항목 수 (기본값: 10, 최대: 50)
- tag: 태그 필터 (선택사항)
- search: 검색어 (제목, 내용) (선택사항)
- sort: 정렬 (created_at, updated_at, title) (기본값: updated_at)
- important: 중요 노트만 필터 (true/false) (선택사항)

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
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
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
    "note": {
      "id": "note_123456789",
      "title": "새로운 노트",
      "content": "노트 내용",
      "tags": ["태그1", "태그2"],
      "isImportant": false,
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  },
  "message": "노트가 생성되었습니다."
}
```

**검증 규칙:**
- `title`: 필수, 1-255자
- `content`: 필수, 1-10000자
- `tags`: 선택사항, 문자열 배열, 각 태그는 1-50자
- `isImportant`: 선택사항, boolean (기본값: false)

### 3. 노트 상세 조회
```http
GET /books/{bookId}/notes/{noteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "note": {
      "id": "note_123456789",
      "title": "노트 제목",
      "content": "노트 내용",
      "tags": ["태그1", "태그2"],
      "isImportant": true,
      "createdAt": "2024-01-16T00:00:00Z",
      "updatedAt": "2024-01-16T00:00:00Z"
    }
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

### 6. 노트 태그 관리
```http
GET /books/{bookId}/notes/tags
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "tags": [
      {
        "name": "핵심개념",
        "count": 5
      },
      {
        "name": "실천방법",
        "count": 3
      }
    ]
  }
}
```

## 💬 인용구 관리 API

### 1. 인용구 목록 조회
```http
GET /books/{bookId}/quotes?page=1&limit=10&tag=동기부여&search=변화&sort=page
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 항목 수 (기본값: 10, 최대: 50)
- tag: 태그 필터 (선택사항)
- search: 검색어 (텍스트, 생각) (선택사항)
- sort: 정렬 (created_at, updated_at, page) (기본값: created_at)
- important: 중요 인용구만 필터 (true/false) (선택사항)
- chapter: 챕터 필터 (선택사항)

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
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
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
    "quote": {
      "id": "quote_123456789",
      "text": "새로운 인용구",
      "page": 50,
      "chapter": "2장",
      "thoughts": "개인적인 생각",
      "tags": ["태그1"],
      "isImportant": false,
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z"
    }
  },
  "message": "인용구가 생성되었습니다."
}
```

**검증 규칙:**
- `text`: 필수, 1-2000자
- `page`: 선택사항, 양의 정수
- `chapter`: 선택사항, 1-100자
- `thoughts`: 선택사항, 1-1000자
- `tags`: 선택사항, 문자열 배열, 각 태그는 1-50자
- `isImportant`: 선택사항, boolean (기본값: false)

### 3. 인용구 상세 조회
```http
GET /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "quote": {
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
  }
}
```

### 4. 인용구 업데이트
```http
PUT /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "text": "수정된 인용구",
  "page": 55,
  "chapter": "2장",
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

### 5. 인용구 삭제
```http
DELETE /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "message": "인용구가 삭제되었습니다."
}
```

### 6. 인용구 태그 관리
```http
GET /books/{bookId}/quotes/tags
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "tags": [
      {
        "name": "동기부여",
        "count": 8
      },
      {
        "name": "핵심",
        "count": 5
      }
    ]
  }
}
```

### 7. 인용구 챕터 목록
```http
GET /books/{bookId}/quotes/chapters
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "chapters": [
      {
        "name": "1장",
        "count": 5
      },
      {
        "name": "2장",
        "count": 3
      }
    ]
  }
}
```

## 🔧 데이터베이스 스키마

### Books 테이블
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover VARCHAR(500),
  category VARCHAR(100) NOT NULL,
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
CREATE INDEX idx_books_created_at ON books(created_at);
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

CREATE INDEX idx_notes_book_id ON notes(book_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_notes_important ON notes(is_important);
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

CREATE INDEX idx_quotes_book_id ON quotes(book_id);
CREATE INDEX idx_quotes_tags ON quotes USING GIN(tags);
CREATE INDEX idx_quotes_page ON quotes(page);
CREATE INDEX idx_quotes_chapter ON quotes(chapter);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_important ON quotes(is_important);
```

## 🚀 구현 우선순위

### Phase 1: 기본 CRUD (1주)
1. 책 관리 CRUD
2. 노트 시스템 CRUD
3. 인용구 관리 CRUD
4. 기본 검증 및 에러 처리

### Phase 2: 고급 기능 (1주)
1. 진행률 추적 및 자동 계산
2. 태그 기반 분류 및 필터링
3. 페이지네이션 구현
4. 검색 기능 (제목, 내용)

### Phase 3: 최적화 (3일)
1. 데이터베이스 인덱스 최적화
2. 쿼리 성능 개선
3. 캐싱 구현
4. API 응답 최적화

## 📝 에러 코드

### 공통 에러 코드
- `VALIDATION_ERROR`: 입력 데이터 검증 실패
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `INTERNAL_ERROR`: 서버 내부 오류

### 도메인별 에러 코드
- `BOOK_NOT_FOUND`: 책을 찾을 수 없음
- `NOTE_NOT_FOUND`: 노트를 찾을 수 없음
- `QUOTE_NOT_FOUND`: 인용구를 찾을 수 없음
- `INVALID_PROGRESS`: 진행률이 올바르지 않음
- `INVALID_PAGE`: 페이지 번호가 올바르지 않음

---

**문서 버전**: v1.0  
**최종 업데이트**: 2024-12-19  
**다음 리뷰**: 2024-12-26 