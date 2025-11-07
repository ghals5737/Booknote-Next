import { PageResponse } from "../pagenation/pagenation";

// 백엔드 BookResponse와 매칭되는 타입
export type BookResponse = {
  id: number | null;
  title: string;
  description: string;
  author: string;
  category: string | null;
  progress: number | null;
  totalPages: number | null;
  imgUrl: string;
  isbn: string;
  publisher: string;
  pubdate: string | null;
}

// 백엔드 API 응답 타입
export type BookApiResponse = {
  success: boolean;
  status: number;
  message: string;
  data: BookResponse;
}

export type UserBookResponse = {
    id: number;
    title: string;
    author: string;
    description: string;
    startDate: string | null;
    updateDate: string | null;
    progress: number;
    totalPages: number;
    currentPage: number;
    category: string;
    rating: number | null;
    coverImage: string | null;
    publisher: string;
    isbn: string;
    noteCnt: number;
    quoteCnt: number;
  }

  export type UserBookResponsePage = PageResponse<UserBookResponse>

// Book Detail API Response Types
export interface BookDetailResponse {
  success: boolean;
  status: number;
  message: string;
  data: BookDetailData;
}

export interface BookDetailData {
  id: number;
  title: string;
  author: string;
  description: string;
  startDate: string;
  updateDate: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  category: string;
  rating: number;
  coverImage: string;
  publisher: string;
  isbn: string;
}

// Quote API Response Types
export interface QuoteResponse {
  success: boolean;
  status: number;
  message: string;
  data: QuotePageData;
}

export interface QuotePageData {
  content: QuoteData[];
  pageable: PageableData;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: SortData;
  numberOfElements: number;
  empty: boolean;
}

export interface QuoteData {
  id: number;
  bookId: number;
  userId: number;
  content: string;
  page: number;
  memo: string;
  isImportant: boolean;
}

// Note API Response Types
export interface NoteResponse {
  success: boolean;
  status: number;
  message: string;
  data: NotePageData;
}

export interface NotePageData {
  content: NoteData[];
  pageable: PageableData;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: SortData;
  numberOfElements: number;
  empty: boolean;
}

export interface NoteData {
  id: number;
  bookId: number;
  title: string;
  content: string;
  html: string;
  isImportant: boolean;
  tagName: string;
  tagList: string[];
  startDate: string;
  updateDate: string;
}

// Common Pagination Types
export interface PageableData {
  pageNumber: number;
  pageSize: number;
  sort: SortData;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SortData {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}