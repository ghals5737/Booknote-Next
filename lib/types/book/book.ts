import { PageResponse } from "../pagenation/pagenation";

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