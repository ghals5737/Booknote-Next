# 사용자 통계 API 명세서

## 📋 API 정보

### 엔드포인트
```
GET /api/v1/stats/dashboard
```

### 설명
사용자의 전체 통계 정보를 한 번에 조회하는 API입니다. 사이드바, 대시보드, 상단 메뉴 등 여러 컴포넌트에서 공통으로 사용되는 통계 데이터를 효율적으로 제공합니다.

---

## 🔐 인증

### 헤더
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### 권한
- 로그인한 사용자만 접근 가능
- 본인의 통계 정보만 조회 가능

---

## 📊 요청

### HTTP 메서드
```http
GET /api/v1/user/stats
```

### Query Parameters
없음 (모든 통계 정보를 한 번에 반환)

---

## 📈 응답

### 성공 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "books": {
      "total": 25,
      "reading": 5,
      "finished": 18,
      "wishlist": 2
    },
    "notes": {
      "total": 150,
      "important": 12,
      "thisMonth": 8
    },
    "quotes": {
      "total": 320,
      "important": 45
    },
    "recentActivity": [
      {
        "type": "note_created",
        "bookTitle": "아토믹 해빗",
        "timestamp": "2024-12-19T10:30:00Z"
      },
      {
        "type": "book_added",
        "bookTitle": "클린 코드",
        "timestamp": "2024-12-18T15:20:00Z"
      },
      {
        "type": "quote_added",
        "bookTitle": "아토믹 해빗",
        "timestamp": "2024-12-18T09:15:00Z"
      }
    ]
  },
  "message": "사용자 통계 정보를 성공적으로 조회했습니다.",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 응답 데이터 구조

#### books 객체
| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 책 개수 |
| `reading` | number | 읽고 있는 책 개수 |
| `finished` | number | 읽기 완료한 책 개수 |
| `wishlist` | number | 위시리스트 책 개수 |

#### notes 객체
| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 노트 개수 |
| `important` | number | 중요 노트 개수 |
| `thisMonth` | number | 이번 달 작성한 노트 개수 |

#### quotes 객체
| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 인용구 개수 |
| `important` | number | 중요 인용구 개수 |

#### recentActivity 배열
| 필드 | 타입 | 설명 |
|------|------|------|
| `type` | string | 활동 타입 (`note_created`, `book_added`, `quote_added`, `book_finished`) |
| `bookTitle` | string | 관련된 책 제목 |
| `timestamp` | string | 활동 시간 (ISO 8601 형식) |

---

## ❌ 에러 응답

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다."
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "접근 권한이 없습니다."
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 내부 오류가 발생했습니다."
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 🚀 성능 최적화

### 데이터베이스 쿼리
```sql
-- 책 통계
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN progress > 0 AND progress < 100 THEN 1 END) as reading,
  COUNT(CASE WHEN progress = 100 THEN 1 END) as finished,
  COUNT(CASE WHEN progress = 0 THEN 1 END) as wishlist
FROM user_books 
WHERE user_id = ?;

-- 노트 통계
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_important = true THEN 1 END) as important,
  COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month
FROM notes n
JOIN user_books ub ON n.book_id = ub.book_id
WHERE ub.user_id = ?;

-- 인용구 통계
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_important = true THEN 1 END) as important
FROM quotes q
JOIN user_books ub ON q.book_id = ub.book_id
WHERE ub.user_id = ?;

-- 최근 활동 (최대 10개)
SELECT 
  'note_created' as type,
  b.title as book_title,
  n.created_at as timestamp
FROM notes n
JOIN user_books ub ON n.book_id = ub.book_id
JOIN books b ON ub.book_id = b.id
WHERE ub.user_id = ?
ORDER BY n.created_at DESC
LIMIT 10;
```

### 캐싱 전략
- Redis 캐싱: 5분 TTL
- 사용자별 캐시 키: `user_stats:{user_id}`
- 데이터 변경 시 캐시 무효화

---

## 🔄 캐시 무효화

다음 작업 시 통계 캐시를 무효화해야 합니다:

### 책 관련
- 책 추가/삭제
- 책 상태 변경 (읽기 시작, 완료)
- 책 진행률 업데이트

### 노트 관련
- 노트 추가/삭제
- 노트 중요도 변경

### 인용구 관련
- 인용구 추가/삭제
- 인용구 중요도 변경

---

## 📝 구현 예시

### 백엔드 (Spring Boot)
```java
@RestController
@RequestMapping("/api/v1/user")
public class UserStatsController {
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsDto>> getUserStats(
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        UserStatsDto stats = userStatsService.getUserStats(userId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
```

### 프론트엔드 (React + SWR)
```typescript
// hooks/use-user-stats.ts
export function useUserStats() {
  const { user, isAuthenticated } = useNextAuth();
  
  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    isAuthenticated && user?.id ? '/api/v1/user/stats' : null,
    async () => {
      const response = await apiGet<UserStats>('/api/v1/user/stats');
      return response.data;
    }
  );
  
  return { stats: data, isLoading, error, mutateStats: mutate };
}
```

---

## 🎯 사용 사례

### 1. 사이드바 네비게이션
```typescript
const { stats } = useUserStats();

const navItems = [
  { label: '내 서재', count: stats?.books?.total },
  { label: '노트', count: stats?.notes?.total },
];
```

### 2. 대시보드 위젯
```typescript
const { stats } = useUserStats();

// 읽고 있는 책 개수 표시
<div>현재 읽고 있는 책: {stats?.books?.reading}권</div>

// 이번 달 노트 작성 수
<div>이번 달 노트: {stats?.notes?.thisMonth}개</div>
```

### 3. 최근 활동 피드
```typescript
const { stats } = useUserStats();

{stats?.recentActivity?.map(activity => (
  <div key={activity.timestamp}>
    {activity.type === 'note_created' && '노트 작성'}
    {activity.bookTitle}
  </div>
))}
```

---

**문서 버전**: v1.0  
**작성일**: 2024-12-19  
**API 버전**: v1
