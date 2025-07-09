# BookNote API 명세서 (Context 타입 기반)

## 📋 문서 정보

- **프로젝트명**: BookNote - 개인 독서 관리 플랫폼
- **API 버전**: v1
- **작성일**: 2024년 12월
- **기반**: BookContext.tsx 타입 정의
- **대상**: Backend Development Team

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

## 📊 타입 정의 (Context 기반)

### Book 타입
```typescript
interface Book {
  id: string
  title: string
  author: string
  cover: string
  category: string
  notes: Note[]
  quotes: Quote[]
  createdAt: Date
  startDate?: Date
  endDate?: Date
  progress: number
  currentPage: number
  totalPages: number
  isbn?: string
  publisher?: string
  description?: string
}
```

### Note 타입
```typescript
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isImportant: boolean
}
```

### Quote 타입
```typescript
interface Quote {
  id: string
  text: string
  page?: number
  chapter?: string
  thoughts?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isImportant: boolean
}
```

### BookSearchResult 타입
```typescript
interface BookSearchResult {
  title: string
  image: string
  isbn: string
  publisher: string
  description: string
  author: string
}
```

## 📚 책 관리 API

### 1. 책 목록 조회
```http
GET /books?page=1&limit=20&category=자기계발&status=reading&search=아토믹&sort=updated_at
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
        "id": "1",
        "title": "아토믹 해빗",
        "author": "제임스 클리어",
        "cover": "/placeholder.svg?height=200&width=150",
        "category": "자기계발",
        "progress": 75,
        "currentPage": 225,
        "totalPages": 300,
        "createdAt": "2024-01-15T00:00:00Z",
        "startDate": "2024-01-15T00:00:00Z",
        "endDate": null,
        "isbn": "9788934985907",
        "publisher": "비즈니스북스",
        "description": "작은 변화가 만드는 놀라운 결과에 대한 책",
        "notes": [
          {
            "id": "1",
            "title": "1% 법칙의 힘",
            "content": "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
            "tags": ["핵심개념", "수학"],
            "createdAt": "2024-01-16T00:00:00Z",
            "updatedAt": "2024-01-16T00:00:00Z",
            "isImportant": true
          }
        ],
        "quotes": [
          {
            "id": "1",
            "text": "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
            "page": 45,
            "chapter": "1장",
            "thoughts": "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
            "tags": ["핵심", "동기부여"],
            "createdAt": "2024-01-17T00:00:00Z",
            "updatedAt": "2024-01-17T00:00:00Z",
            "isImportant": true
          }
        ]
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
  },
  "message": "책 목록을 성공적으로 조회했습니다."
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
  "cover": "/placeholder.svg?height=200&width=150",
  "category": "자기계발",
  "progress": 0,
  "currentPage": 0,
  "totalPages": 300,
  "startDate": "2024-12-19T00:00:00Z",
  "endDate": null,
  "isbn": "9788934985907",
  "publisher": "출판사명",
  "description": "책 설명"
}

**Request Body 필드 설명:**
- title: 책 제목 (필수, 1-255자)
- author: 저자 (필수, 1-255자)
- cover: 표지 이미지 URL (필수)
- category: 카테고리 (필수, 1-100자)
- progress: 진행률 (기본값: 0, 0-100)
- currentPage: 현재 페이지 (기본값: 0)
- totalPages: 전체 페이지 (기본값: 0)
- startDate: 읽기 시작일 (선택사항, ISO 8601 형식)
- endDate: 읽기 완료일 (선택사항, ISO 8601 형식)
- isbn: ISBN (선택사항, ISBN 형식 검증)
- publisher: 출판사 (선택사항, 1-255자)
- description: 책 설명 (선택사항, 1-1000자)

Response: 201 Created
{
  "success": true,
  "data": {
    "book": {
      "id": "4",
      "title": "새로운 책",
      "author": "작가명",
      "cover": "/placeholder.svg?height=200&width=150",
      "category": "자기계발",
      "progress": 0,
      "currentPage": 0,
      "totalPages": 300,
      "createdAt": "2024-12-19T10:30:00Z",
      "startDate": "2024-12-19T00:00:00Z",
      "endDate": null,
      "isbn": "9788934985907",
      "publisher": "출판사명",
      "description": "책 설명",
      "notes": [],
      "quotes": []
    }
  },
  "message": "책이 등록되었습니다."
}

**Response Body 필드 설명:**
- id: 책 고유 ID (자동 생성)
- createdAt: 생성일시 (자동 생성)
- notes: 노트 배열 (초기값: 빈 배열)
- quotes: 인용구 배열 (초기값: 빈 배열)
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
      "id": "1",
      "title": "아토믹 해빗",
      "author": "제임스 클리어",
      "cover": "/placeholder.svg?height=200&width=150",
      "category": "자기계발",
      "progress": 75,
      "currentPage": 225,
      "totalPages": 300,
      "createdAt": "2024-01-15T00:00:00Z",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": null,
      "isbn": "9788934985907",
      "publisher": "비즈니스북스",
      "description": "작은 변화가 만드는 놀라운 결과에 대한 책",
      "notes": [
        {
          "id": "1",
          "title": "1% 법칙의 힘",
          "content": "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
          "tags": ["핵심개념", "수학"],
          "createdAt": "2024-01-16T00:00:00Z",
          "updatedAt": "2024-01-16T00:00:00Z",
          "isImportant": true
        }
      ],
      "quotes": [
        {
          "id": "1",
          "text": "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
          "page": 45,
          "chapter": "1장",
          "thoughts": "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
          "tags": ["핵심", "동기부여"],
          "createdAt": "2024-01-17T00:00:00Z",
          "updatedAt": "2024-01-17T00:00:00Z",
          "isImportant": true
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
  "title": "수정된 제목",
  "author": "수정된 저자",
  "category": "수정된 카테고리",
  "description": "수정된 설명",
  "totalPages": 350,
  "publisher": "수정된 출판사",
  "cover": "/placeholder.svg?height=200&width=150"
}

**Request Body 필드 설명 (모두 선택사항):**
- progress: 진행률 (0-100)
- currentPage: 현재 페이지 (양의 정수)
- endDate: 읽기 완료일 (ISO 8601 형식)
- title: 책 제목 (1-255자)
- author: 저자 (1-255자)
- category: 카테고리 (1-100자)
- description: 책 설명 (1-1000자)
- totalPages: 전체 페이지 (양의 정수)
- publisher: 출판사 (1-255자)
- cover: 표지 이미지 URL
- startDate: 읽기 시작일 (ISO 8601 형식)
- isbn: ISBN (ISBN 형식 검증)

**진행률 계산 로직:**
- progress가 제공되면 그 값을 사용
- progress가 제공되지 않으면 (currentPage / totalPages) * 100으로 계산
- progress가 100이 되면 자동으로 endDate를 현재 시간으로 설정

Response: 200 OK
{
  "success": true,
  "data": {
    "book": {
      "id": "1",
      "title": "수정된 제목",
      "author": "수정된 저자",
      "cover": "/placeholder.svg?height=200&width=150",
      "category": "수정된 카테고리",
      "progress": 80,
      "currentPage": 240,
      "totalPages": 350,
      "createdAt": "2024-01-15T00:00:00Z",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-02-01T00:00:00Z",
      "isbn": "9788934985907",
      "publisher": "수정된 출판사",
      "description": "수정된 설명",
      "notes": [...],
      "quotes": [...]
    }
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

## 📝 노트 시스템 API

### 1. 노트 목록 조회
```http
GET /books/{bookId}/notes?page=1&limit=10&tag=핵심개념&search=습관&sort=updated_at&important=false
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
        "id": "1",
        "title": "1% 법칙의 힘",
        "content": "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
        "tags": ["핵심개념", "수학"],
        "createdAt": "2024-01-16T00:00:00Z",
        "updatedAt": "2024-01-16T00:00:00Z",
        "isImportant": true
      },
      {
        "id": "2",
        "title": "습관 스택킹",
        "content": "기존 습관에 새로운 습관을 연결하는 방법. \"커피를 마신 후에 명상을 5분 한다\"",
        "tags": ["실천방법", "습관"],
        "createdAt": "2024-01-18T00:00:00Z",
        "updatedAt": "2024-01-18T00:00:00Z",
        "isImportant": false
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
  },
  "message": "노트 목록을 성공적으로 조회했습니다."
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

**Request Body 필드 설명:**
- title: 노트 제목 (필수, 1-255자)
- content: 노트 내용 (필수, 1-10000자)
- tags: 태그 배열 (선택사항, 각 태그는 1-50자)
- isImportant: 중요 노트 여부 (선택사항, 기본값: false)

Response: 201 Created
{
  "success": true,
  "data": {
    "note": {
      "id": "4",
      "title": "새로운 노트",
      "content": "노트 내용",
      "tags": ["태그1", "태그2"],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "isImportant": false
    }
  },
  "message": "노트가 생성되었습니다."
}

**Response Body 필드 설명:**
- id: 노트 고유 ID (자동 생성)
- createdAt: 생성일시 (자동 생성)
- updatedAt: 수정일시 (자동 생성, 초기값은 createdAt과 동일)
```

### 3. 노트 상세 조회
```http
GET /books/{bookId}/notes/{noteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "note": {
      "id": "1",
      "title": "1% 법칙의 힘",
      "content": "매일 1%씩 개선하면 1년 후 37배 성장한다. 작은 변화가 복리 효과를 만든다.",
      "tags": ["핵심개념", "수학"],
      "createdAt": "2024-01-16T00:00:00Z",
      "updatedAt": "2024-01-16T00:00:00Z",
      "isImportant": true
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

**Request Body 필드 설명 (모두 선택사항):**
- title: 노트 제목 (1-255자)
- content: 노트 내용 (1-10000자)
- tags: 태그 배열 (각 태그는 1-50자)
- isImportant: 중요 노트 여부 (boolean)

Response: 200 OK
{
  "success": true,
  "data": {
    "note": {
      "id": "1",
      "title": "수정된 제목",
      "content": "수정된 내용",
      "tags": ["새태그1", "새태그2"],
      "createdAt": "2024-01-16T00:00:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "isImportant": true
    }
  },
  "message": "노트가 업데이트되었습니다."
}

**Response Body 필드 설명:**
- updatedAt: 수정일시 (자동 업데이트)
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

## 💬 인용구 관리 API

### 1. 인용구 목록 조회
```http
GET /books/{bookId}/quotes?page=1&limit=10&tag=핵심&search=습관&sort=page&important=true
Authorization: Bearer <jwt_token>

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 항목 수 (기본값: 10, 최대: 50)
- tag: 태그 필터 (선택사항)
- search: 검색어 (인용구 텍스트, 생각) (선택사항)
- sort: 정렬 (created_at, updated_at, page, chapter) (기본값: created_at)
- important: 중요 인용구만 필터 (true/false) (선택사항)
- chapter: 챕터 필터 (선택사항)

Response: 200 OK
{
  "success": true,
  "data": {
    "quotes": [
      {
        "id": "1",
        "text": "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
        "page": 45,
        "chapter": "1장",
        "thoughts": "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
        "tags": ["핵심", "동기부여"],
        "createdAt": "2024-01-17T00:00:00Z",
        "updatedAt": "2024-01-17T00:00:00Z",
        "isImportant": true
      },
      {
        "id": "2",
        "text": "변화의 가장 효과적인 방법은 무엇을 하려고 하는지가 아니라 누가 되려고 하는지에 집중하는 것이다.",
        "page": 78,
        "chapter": null,
        "thoughts": "정체성 기반 습관의 중요성을 알게 되었다.",
        "tags": ["정체성", "변화"],
        "createdAt": "2024-01-19T00:00:00Z",
        "updatedAt": "2024-01-19T00:00:00Z",
        "isImportant": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "인용구 목록을 성공적으로 조회했습니다."
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

**Request Body 필드 설명:**
- text: 인용구 텍스트 (필수, 1-2000자)
- page: 페이지 번호 (선택사항, 양의 정수)
- chapter: 챕터 정보 (선택사항, 1-100자)
- thoughts: 개인적인 생각 (선택사항, 1-5000자)
- tags: 태그 배열 (선택사항, 각 태그는 1-50자)
- isImportant: 중요 인용구 여부 (선택사항, 기본값: false)

Response: 201 Created
{
  "success": true,
  "data": {
    "quote": {
      "id": "4",
      "text": "새로운 인용구",
      "page": 50,
      "chapter": "2장",
      "thoughts": "개인적인 생각",
      "tags": ["태그1"],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "isImportant": false
    }
  },
  "message": "인용구가 생성되었습니다."
}

**Response Body 필드 설명:**
- id: 인용구 고유 ID (자동 생성)
- createdAt: 생성일시 (자동 생성)
- updatedAt: 수정일시 (자동 생성, 초기값은 createdAt과 동일)
```
{
  "success": true,
  "data": {
    "quote": {
      "id": "4",
      "text": "새로운 인용구",
      "page": 50,
      "chapter": "2장",
      "thoughts": "개인적인 생각",
      "tags": ["태그1"],
      "createdAt": "2024-12-19T10:30:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "isImportant": false
    }
  },
  "message": "인용구가 생성되었습니다."
}
```

### 3. 인용구 상세 조회
```http
GET /books/{bookId}/quotes/{quoteId}
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "quote": {
      "id": "1",
      "text": "성공은 매일의 습관이 만들어내는 결과다. 당신이 반복하는 것이 당신이 된다.",
      "page": 45,
      "chapter": "1장",
      "thoughts": "정말 와닿는 말이다. 작은 습관들이 모여서 큰 변화를 만든다는 것을 깨달았다.",
      "tags": ["핵심", "동기부여"],
      "createdAt": "2024-01-17T00:00:00Z",
      "updatedAt": "2024-01-17T00:00:00Z",
      "isImportant": true
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

**Request Body 필드 설명 (모두 선택사항):**
- text: 인용구 텍스트 (1-2000자)
- page: 페이지 번호 (양의 정수)
- chapter: 챕터 정보 (1-100자)
- thoughts: 개인적인 생각 (1-5000자)
- tags: 태그 배열 (각 태그는 1-50자)
- isImportant: 중요 인용구 여부 (boolean)

Response: 200 OK
{
  "success": true,
  "data": {
    "quote": {
      "id": "1",
      "text": "수정된 인용구",
      "page": 55,
      "chapter": "2장",
      "thoughts": "수정된 생각",
      "tags": ["새태그1"],
      "createdAt": "2024-01-17T00:00:00Z",
      "updatedAt": "2024-12-19T10:30:00Z",
      "isImportant": true
    }
  },
  "message": "인용구가 업데이트되었습니다."
}

**Response Body 필드 설명:**
- updatedAt: 수정일시 (자동 업데이트)
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

## 🔍 책 검색 API

### 1. 외부 책 검색
```http
GET /books/search?q=아토믹 해빗&page=1&limit=20&source=naver
Authorization: Bearer <jwt_token>

Query Parameters:
- q: 검색어 (필수, 1-100자)
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 항목 수 (기본값: 20, 최대: 50)
- source: 검색 소스 (naver, kakao, google) (기본값: naver)

Response: 200 OK
{
  "success": true,
  "data": {
    "books": [
      {
        "title": "아토믹 해빗",
        "image": "/placeholder.svg?height=200&width=150",
        "isbn": "9788934985907",
        "publisher": "비즈니스북스",
        "description": "작은 변화가 만드는 놀라운 결과에 대한 책",
        "author": "제임스 클리어"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "책 검색이 완료되었습니다."
}

**Response Body 필드 설명:**
- title: 책 제목
- image: 표지 이미지 URL
- isbn: ISBN (있을 경우)
- publisher: 출판사
- description: 책 설명
- author: 저자
```

## 🔧 데이터베이스 스키마

### Books 테이블
```sql
CREATE TABLE books (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  progress INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  start_date DATE,
  end_date DATE,
  isbn VARCHAR(20),
  publisher VARCHAR(255),
  description TEXT
);
```

### Notes 테이블
```sql
CREATE TABLE notes (
  id VARCHAR(255) PRIMARY KEY,
  book_id VARCHAR(255) REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### Quotes 테이블
```sql
CREATE TABLE quotes (
  id VARCHAR(255) PRIMARY KEY,
  book_id VARCHAR(255) REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  chapter VARCHAR(100),
  thoughts TEXT,
  tags TEXT[],
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## 📝 Context 함수 매핑

### BookContext 함수 → API 엔드포인트

| Context 함수 | HTTP 메서드 | 엔드포인트 | 설명 |
|-------------|-------------|-----------|------|
| `addBook` | POST | `/books` | 책 등록 |
| `updateBook` | PUT | `/books/{bookId}` | 책 정보 업데이트 |
| `addNote` | POST | `/books/{bookId}/notes` | 노트 생성 |
| `updateNote` | PUT | `/books/{bookId}/notes/{noteId}` | 노트 업데이트 |
| `deleteNote` | DELETE | `/books/{bookId}/notes/{noteId}` | 노트 삭제 |
| `addQuote` | POST | `/books/{bookId}/quotes` | 인용구 생성 |
| `updateQuote` | PUT | `/books/{bookId}/quotes/{quoteId}` | 인용구 업데이트 |
| `deleteQuote` | DELETE | `/books/{bookId}/quotes/{quoteId}` | 인용구 삭제 |
| `searchBooks` | GET | `/books/search?q={query}` | 외부 책 검색 |

## 🚀 구현 우선순위

### Phase 1: 기본 CRUD (1주)
1. 책 관리 CRUD (`/books`)
2. 노트 시스템 CRUD (`/books/{bookId}/notes`)
3. 인용구 관리 CRUD (`/books/{bookId}/quotes`)

### Phase 2: 고급 기능 (1주)
1. 외부 책 검색 API (`/books/search`)
2. 진행률 자동 계산 로직
3. 태그 기반 필터링

### Phase 3: 최적화 (3일)
1. 데이터베이스 인덱스 최적화
2. API 응답 최적화
3. 에러 처리 개선

---

**문서 버전**: v1.0  
**최종 업데이트**: 2024-12-19  
**기반 타입**: BookContext.tsx 