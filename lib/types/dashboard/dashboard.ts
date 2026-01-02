// 백엔드 API 응답 타입
export interface RecentNoteItem {
    id: number;
    title: string;
    bookId: number | null;
    bookTitle: string | null;
    isImportant: boolean;
    createdAt: string;
  }
  
  export interface DashboardInfoResponse {
    noteCount: number;
    bookCount: number;
    finishedBookCount: number;
    bookmarkedNoteCount: number;
    recentNotes: RecentNoteItem[];
  }
  
  // API 요청 옵션
  export interface DashboardOptions {
    includeRecent?: boolean;
    recentSize?: number;
  }
  
  // 최근 활동 아이템 타입
  export interface RecentActivityItem {
    type: 'NOTE_CREATED' | 'BOOK_ADDED' | 'QUOTE_ADDED' | 'BOOK_FINISHED' | 'note_created' | 'book_added' | 'quote_added' | 'book_finished';
    bookTitle: string;
    timestamp: string;
  }

  // 기존 컴포넌트와의 호환성을 위한 변환된 타입
  export interface DashboardStats {
    books: {
      total: number;
      reading: number;
      finished: number;
    };
    notes: {
      total: number;
      important: number;
    };
    recentNotes: RecentNoteItem[];
    recentActivity?: RecentActivityItem[];
  }

  // 최근 활동 API 타입 정의
  export type ActivityType = 'note' | 'reading' | 'finished';

  export interface ActivityResponse {
    id: number;
    type: ActivityType;
    bookId: number;
    bookTitle: string;
    bookCover: string;
    content?: string; // type이 'note'인 경우만
    pages?: number; // type이 'reading'인 경우만
    timestamp: string; // ISO 8601 형식
  }

  export interface ActivitiesApiResponse {
    success: boolean;
    status: number;
    message: string;
    data: ActivityResponse[];
    timestamp: string;
  }

  export interface ActivitiesQueryParams {
    limit?: number; // 기본값: 10, 최대: 50
    type?: ActivityType; // 활동 타입 필터
  }

  // 통합 대시보드 데이터 API 타입 정의
  export interface DashboardStatistics {
    totalBooks: number;
    readingBooks: number;
    finishedBooks: number;
    totalNotes: number;
    totalQuotes: number;
    readingStreak: number;
  }

  export interface DashboardGoal {
    id: number;
    target: number;
    current: number;
    progress: number;
  }

  export interface DashboardGoals {
    monthly: DashboardGoal | null;
    yearly: DashboardGoal | null;
  }

  export interface DashboardQuoteOfTheDay {
    id: number;
    quote: string;
    author: string;
    bookTitle: string;
    bookId: number;
    bookCover: string;
  }

  export interface DashboardCurrentTimer {
    timerId: number;
    bookId: number;
    bookTitle: string;
    elapsedMinutes: number;
    status: 'running' | 'completed' | 'cancelled';
  }

  export interface UnifiedDashboardData {
    statistics: DashboardStatistics;
    goals: DashboardGoals;
    recentActivities: ActivityResponse[];
    quoteOfTheDay: DashboardQuoteOfTheDay | null;
    currentTimer: DashboardCurrentTimer | null;
  }

  export interface UnifiedDashboardApiResponse {
    success: boolean;
    status: number;
    message: string;
    data: UnifiedDashboardData;
    timestamp: string;
  }

  export interface UnifiedDashboardQueryParams {
    includeActivities?: boolean; // 기본값: true
    includeQuote?: boolean; // 기본값: true
    includeGoals?: boolean; // 기본값: true
    includeTimer?: boolean; // 기본값: true
    activitiesLimit?: number; // 기본값: 10
  }
  