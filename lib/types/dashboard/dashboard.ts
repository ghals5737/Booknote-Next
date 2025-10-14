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
  }
  