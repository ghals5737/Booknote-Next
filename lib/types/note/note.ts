import { PageResponse } from "../pagenation/pagenation";

export type NoteResponse = {
    id: number;
    bookId: number;
    title: string;
    content: string;
    html: string;
    isImportant: boolean;
    tagName: string;
    tagList: string[];
    startDate: string | null;
    updateDate: string | null;
    bookTitle: string;
}

export type NoteResponsePage = PageResponse<NoteResponse>
