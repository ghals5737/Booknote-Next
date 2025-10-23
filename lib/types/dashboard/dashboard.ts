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
    type: 'note_created' | 'book_added' | 'quote_added' | 'book_finished';
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
  