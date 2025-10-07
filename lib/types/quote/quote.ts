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