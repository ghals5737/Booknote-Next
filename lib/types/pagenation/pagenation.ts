export type Sort = {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  }
  
  // 페이지 정보 타입
  export type Pageable = {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  }
  
  // 페이지네이션 응답 타입
  export type PageResponse<T> = {
    content: T[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: Sort;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  }