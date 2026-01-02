// 독서 타이머 API 타입 정의

export type TimerStatus = 'running' | 'completed' | 'cancelled';

export interface StartTimerRequest {
  bookId: number; // 필수
  targetMinutes?: number; // 선택 (분 단위)
}

export interface StartTimerResponse {
  timerId: number;
  bookId: number;
  bookTitle: string;
  startTime: string; // ISO 8601
  targetMinutes?: number;
  status: TimerStatus;
}

export interface StartTimerApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: StartTimerResponse;
  timestamp: string;
}

export interface StopTimerRequest {
  timerId: number; // 필수
  readPages?: number; // 선택 (읽은 페이지 수)
}

export interface StopTimerResponse {
  timerId: number;
  bookId: number;
  bookTitle: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationMinutes: number;
  readPages?: number;
  status: TimerStatus;
}

export interface StopTimerApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: StopTimerResponse;
  timestamp: string;
}

export interface CurrentTimerResponse {
  timerId: number;
  bookId: number;
  bookTitle: string;
  bookCover?: string;
  startTime: string; // ISO 8601
  targetMinutes?: number;
  elapsedMinutes: number;
  status: TimerStatus;
}

export interface CurrentTimerApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CurrentTimerResponse | null;
  timestamp: string;
}

export interface TimerHistoryItem {
  timerId: number;
  bookId: number;
  bookTitle: string;
  bookCover?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationMinutes: number;
  readPages?: number;
  status: TimerStatus;
}

export interface TimerHistoryPage {
  content: TimerHistoryItem[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

export interface TimerHistoryApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: TimerHistoryPage;
  timestamp: string;
}

export interface TimerHistoryQueryParams {
  page?: number; // 기본값: 0 (0부터 시작)
  size?: number; // 기본값: 20
  bookId?: number; // 책 ID로 필터링
  startDate?: string; // ISO 8601 형식
  endDate?: string; // ISO 8601 형식
}

