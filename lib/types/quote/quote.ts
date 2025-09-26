
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