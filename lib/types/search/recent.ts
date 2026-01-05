// 최근 검색어 API 타입 정의

export type RecentSearchType = 'all' | 'books' | 'notes' | 'quotes';

export type RecentSearch = {
  id: number;
  userId: number;
  query: string;
  type: RecentSearchType;
  searchCount: number;
  lastSearchedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RecentSearchListItem = {
  id: number;
  query: string;
  type: RecentSearchType;
  searchCount: number;
  lastSearchedAt: string;
};

export type SaveRecentSearchRequest = {
  query: string;
  type?: RecentSearchType;
};

export type SaveRecentSearchResponse = {
  success: boolean;
  status: number;
  message: string;
  data: RecentSearch;
};

export type GetRecentSearchesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    recentSearches: RecentSearchListItem[];
    total: number;
  };
};

export type DeleteRecentSearchResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: number;
    deleted: boolean;
  };
};

export type DeleteAllRecentSearchesResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    deletedCount: number;
  };
};

export type RecentSearchErrorResponse = {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  fieldErrors?: Array<{
    field: string;
    error: string;
  }>;
  details?: string;
};

