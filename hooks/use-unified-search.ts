import {
    SearchFilters,
    SearchResult,
    SearchSuggestionsResponse,
    UnifiedSearchResponse
} from '@/lib/types/search/search';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { useNextAuth } from './use-next-auth';

// 통합검색 API 호출 함수
const searchFetcher = async (url: string): Promise<UnifiedSearchResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('검색 요청 실패');
  }
  return response.json();
};

// 자동완성 API 호출 함수
const suggestionsFetcher = async (url: string): Promise<SearchSuggestionsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('자동완성 요청 실패');
  }
  return response.json();
};

export function useUnifiedSearch() {
  const { user } = useNextAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    page: 1,
    size: 10
  });
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // 검색 키 생성
  const searchKey = user?.id && query.trim() 
    ? `/api/v1/search/unified?query=${encodeURIComponent(query)}&type=${filters.type}&page=${filters.page}&size=${filters.size}&userId=${user.id}`
    : null;

  // 자동완성 키 생성
  const suggestionsKey = user?.id && query.trim() 
    ? `/api/v1/search/suggestions?query=${encodeURIComponent(query)}&userId=${user.id}&limit=5`
    : null;

  // 검색 데이터 가져오기
  const { 
    data: searchData, 
    error: searchError, 
    isLoading: isSearchLoading 
  } = useSWR(searchKey, searchFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // 자동완성 데이터 가져오기
  const { 
    data: suggestionsData, 
    error: suggestionsError, 
    isLoading: isSuggestionsLoading 
  } = useSWR(suggestionsKey, suggestionsFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // 검색어 변경 핸들러 (디바운스 적용)
  const handleQueryChange = useCallback((newQuery: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setQuery(newQuery);
      setFilters(prev => ({ ...prev, page: 1 })); // 검색어 변경 시 페이지 리셋
    }, 300); // 300ms 디바운스
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // 검색 결과 합치기
  const allResults: SearchResult[] = searchData?.data 
    ? [
        ...searchData.data.books,
        ...searchData.data.notes,
        ...searchData.data.quotes
      ].sort((a, b) => b.relevanceScore - a.relevanceScore)
    : [];

  // 검색 실행
  const executeSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
  }, []);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setFilters({
      type: 'all',
      page: 1,
      size: 10
    });
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    // 상태
    query,
    filters,
    isOpen,
    setIsOpen,
    
    // 데이터
    searchData,
    suggestionsData,
    allResults,
    
    // 로딩 상태
    isSearchLoading,
    isSuggestionsLoading,
    
    // 에러
    searchError,
    suggestionsError,
    
    // 액션
    handleQueryChange,
    handleFilterChange,
    handlePageChange,
    executeSearch,
    clearSearch,
    
    // 통계
    totalResults: searchData?.pagination?.total || 0,
    hasMore: searchData?.pagination?.hasMore || false,
  };
}
