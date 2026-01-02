import { Pageable, Sort } from "../pagenation/pagenation";

export type CreateQuoteRequest = {
    bookId: number;
    text: string;
    page: number;
}

export type QuoteResponse = {
    id: number;
    bookId: number;
    userId: number;
    content: string;
    page: number;
    memo: string;
    isImportant: boolean;
}

export type QuoteResponsePage = {
    content: QuoteResponse[];
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

// 오늘의 인용구 API 타입 정의
export interface QuoteOfTheDayResponse {
    id: number;
    quote: string;
    author: string;
    bookTitle: string;
    bookId: number;
    bookCover: string;
    page?: number;
    createdAt: string;
}

export interface QuoteOfTheDayApiResponse {
    success: boolean;
    status: number;
    message: string;
    data: QuoteOfTheDayResponse | null;
    timestamp: string;
}