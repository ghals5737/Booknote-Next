# 프론트엔드-백엔드 연동 테스트 가이드

## 환경 설정

### 1. 백엔드 서버 실행
```bash
cd Booknote2
./gradlew bootRun
```
백엔드 서버는 `http://localhost:9100`에서 실행됩니다.

### 2. 프론트엔드 서버 실행
```bash
cd Booknote-Next
npm run dev
```
프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## 테스트 시나리오

### 서재 기능 테스트

1. **책 추가 테스트**
   - 프론트엔드에서 "내 서재" 페이지로 이동
   - "책 추가" 버튼 클릭
   - 책 정보 입력 후 저장
   - 백엔드 API 호출 확인: `POST /api/v1/books` → `POST /api/v1/user-books`

2. **책 목록 조회 테스트**
   - 서재 페이지에서 책 목록이 정상적으로 표시되는지 확인
   - 백엔드 API 호출 확인: `GET /api/v1/user/books` (Authorization 헤더 포함)

3. **책 상세 조회 테스트**
   - 책 카드를 클릭하여 상세 페이지로 이동
   - 책 정보가 정상적으로 표시되는지 확인
   - 백엔드 API 호출 확인: `GET /api/v1/user/books/{bookId}` (Authorization 헤더 포함)

### 노트 기능 테스트

1. **노트 목록 조회 테스트**
   - "노트" 페이지로 이동
   - 노트 목록이 정상적으로 표시되는지 확인
   - 백엔드 API 호출 확인: `GET /api/v1/notes/user` (Authorization 헤더 포함)

2. **노트 생성 테스트**
   - "노트 생성" 페이지로 이동
   - 노트 정보 입력 후 저장
   - 백엔드 API 호출 확인: `POST /api/v1/notes` (Authorization 헤더 포함)

3. **노트 상세 조회 테스트**
   - 노트 목록에서 노트 클릭
   - 노트 상세 정보가 정상적으로 표시되는지 확인
   - 백엔드 API 호출 확인: `GET /api/v1/notes/{noteId}` (Authorization 헤더 포함)

4. **노트 수정 테스트**
   - 노트 상세 페이지에서 "수정" 버튼 클릭
   - 내용 수정 후 저장
   - 백엔드 API 호출 확인: `PUT /api/v1/notes/{noteId}` (Authorization 헤더 포함)

5. **노트 삭제 테스트**
   - 노트 상세 페이지에서 "삭제" 버튼 클릭
   - 삭제 확인 후 삭제 실행
   - 백엔드 API 호출 확인: `DELETE /api/v1/notes` (Authorization 헤더 포함)

6. **책별 노트 조회 테스트**
   - 책 상세 페이지에서 노트 섹션 확인
   - 해당 책의 노트들이 정상적으로 표시되는지 확인
   - 백엔드 API 호출 확인: `GET /api/v1/notes/user/books/{bookId}` (Authorization 헤더 포함)

## API 엔드포인트 요약

### 서재 관련 API (토큰 기반)
- `GET /api/v1/user/books` - 현재 사용자 서재 조회
- `GET /api/v1/user/books/{bookId}` - 책 상세 조회
- `POST /api/v1/books` - 책 생성
- `POST /api/v1/user-books` - 사용자 서재에 책 추가

### 노트 관련 API (토큰 기반)
- `GET /api/v1/notes/user` - 현재 사용자 노트 목록 조회
- `GET /api/v1/notes/{noteId}` - 노트 상세 조회
- `GET /api/v1/notes/user/books/{bookId}` - 책별 노트 조회
- `POST /api/v1/notes` - 노트 생성
- `PUT /api/v1/notes/{noteId}` - 노트 수정
- `DELETE /api/v1/notes` - 노트 삭제

### 인증 관련 API
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `POST /api/v1/auth/logout` - 로그아웃

## 문제 해결

### 일반적인 문제
1. **CORS 오류**: 백엔드에서 CORS 설정 확인
2. **API URL 불일치**: 환경 변수 `NEXT_PUBLIC_API_URL` 확인
3. **토큰 인증 오류**: Authorization 헤더가 올바르게 전달되는지 확인
4. **토큰 만료**: Access Token이 만료되었는지 확인, Refresh Token으로 갱신 필요
5. **사용자 ID 변환**: JWT 토큰에서 사용자 ID가 올바르게 추출되는지 확인
6. **서재 오류**: 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트

### 디버깅 팁
1. 브라우저 개발자 도구의 Network 탭에서 API 호출 확인
2. 백엔드 로그에서 요청/응답 확인
3. 프론트엔드 콘솔에서 에러 메시지 확인
4. localStorage에서 `access_token`, `refresh_token` 값 확인
5. JWT 토큰 디코딩하여 사용자 정보 확인 (jwt.io 사이트 활용)
6. 사용자 인증 상태 확인 (`useNextAuth` 훅의 `user` 객체)
7. Authorization 헤더가 모든 API 요청에 포함되는지 확인
8. 서재 페이지에서 "로그인 확인" 버튼으로 토큰 상태 확인
9. 브라우저 콘솔에서 "Fetching books from:" 로그 확인
