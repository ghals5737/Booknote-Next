// 최근 검색어 관련 API 함수

import type {
    DeleteAllRecentSearchesResponse,
    DeleteRecentSearchResponse,
    GetRecentSearchesResponse,
    RecentSearchType,
    SaveRecentSearchRequest,
    SaveRecentSearchResponse,
} from '@/lib/types/search/recent';
import { getSession } from 'next-auth/react';

/**
 * 검색어 저장
 * @param query 검색어 (2-100자)
 * @param type 검색 타입 (기본값: 'all')
 */
export async function saveRecentSearch(
  query: string,
  type: RecentSearchType = 'all'
): Promise<SaveRecentSearchResponse> {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const url = '/api/v1/search/recent';
  const body: SaveRecentSearchRequest = {
    query: query.trim(),
    type,
  };

  console.log('[saveRecentSearch] URL:', url);
  console.log('[saveRecentSearch] Body:', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { message?: string })?.message ||
      `검색어 저장 실패 (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as SaveRecentSearchResponse;
}

/**
 * 최근 검색어 목록 조회
 * @param limit 조회할 검색어 개수 (기본값: 10, 최대: 50)
 * @param type 검색 타입 필터 (기본값: 'all')
 */
export async function getRecentSearches(
  limit: number = 10,
  type: RecentSearchType | 'all' = 'all'
): Promise<GetRecentSearchesResponse> {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(type !== 'all' && { type }),
  });

  const url = `/api/v1/search/recent?${params}`;

  console.log('[getRecentSearches] URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { message?: string })?.message ||
      `최근 검색어 조회 실패 (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as GetRecentSearchesResponse;
}

/**
 * 개별 검색어 삭제
 * @param id 삭제할 검색어 ID
 */
export async function deleteRecentSearch(
  id: number
): Promise<DeleteRecentSearchResponse> {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const url = `/api/v1/search/recent/${id}`;

  console.log('[deleteRecentSearch] URL:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // 404 에러 처리
    if (response.status === 404) {
      throw new Error('검색어를 찾을 수 없습니다.');
    }
    
    // 403 에러 처리
    if (response.status === 403) {
      throw new Error('다른 사용자의 검색어는 삭제할 수 없습니다.');
    }

    const errorMessage =
      (errorData as { message?: string })?.message ||
      `검색어 삭제 실패 (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as DeleteRecentSearchResponse;
}

/**
 * 전체 검색어 삭제
 * 사용자의 모든 최근 검색어를 삭제합니다.
 */
export async function deleteAllRecentSearches(): Promise<DeleteAllRecentSearchesResponse> {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const url = '/api/v1/search/recent';

  console.log('[deleteAllRecentSearches] URL:', url);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      (errorData as { message?: string })?.message ||
      `전체 검색어 삭제 실패 (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as DeleteAllRecentSearchesResponse;
}

