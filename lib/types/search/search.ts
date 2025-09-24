// 통합검색 관련 타입 정의

export interface SearchResult {
  id: number;
  type: 'book' | 'note' | 'quote';
  title: string;
  content?: string;
  subtitle?: string;
  bookTitle?: string;
  tagList?: string[];
  progress?: number;
  relevanceScore: number;
}

export interface UnifiedSearchResponse {
  success: boolean;
  data: {
    books: SearchResult[];
    notes: SearchResult[];
    quotes: SearchResult[];
    suggestions?: SearchSuggestion[];
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'book' | 'note' | 'quote' | 'tag';
  count: number;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: SearchSuggestion[];
  };
}

export interface SearchFilters {
  type: 'all' | 'books' | 'notes' | 'quotes';
  page: number;
  size: number;
}
