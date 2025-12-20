// 통합 검색 API 타입 정의

export type UnifiedSearchBookItem = {
  id: string;
  title: string;
  author: string;
  notesCount?: number;
  quotesCount?: number;
};

export type UnifiedSearchNoteItem = {
  id: string;
  bookId: string;
  bookTitle?: string;
  title: string;
  content?: string;
  snippet?: string;
};

export type UnifiedSearchQuoteItem = {
  id: string;
  bookId: string;
  bookTitle?: string;
  text: string;
  page?: number;
  chapter?: string;
};

export type UnifiedSearchResponse = {
  success: boolean;
  data?: {
    books?: UnifiedSearchBookItem[];
    notes?: UnifiedSearchNoteItem[];
    quotes?: UnifiedSearchQuoteItem[];
  };
  message?: string;
};

// 검색 섹션 컴포넌트에서 사용하는 변환된 타입
export type TransformedBookItem = {
  id: string;
  title: string;
  author: string;
  meta: string;
};

export type TransformedNoteItem = {
  id: string;
  bookId: string;
  title: string;
  bookTitle: string;
  snippet: string;
};

export type TransformedQuoteItem = {
  id: string;
  bookId: string;
  text: string;
  bookTitle: string;
  meta: string;
};

