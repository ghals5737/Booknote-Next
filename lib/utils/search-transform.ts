// 통합 검색 API 응답을 컴포넌트 타입에 맞게 변환하는 유틸리티 함수

import type {
    TransformedBookItem,
    TransformedNoteItem,
    TransformedQuoteItem,
    UnifiedSearchBookItem,
    UnifiedSearchNoteItem,
    UnifiedSearchQuoteItem,
} from "@/lib/types/search/unified";

export function transformBooks(
  books?: UnifiedSearchBookItem[]
): TransformedBookItem[] {
  if (!books) return [];
  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    meta: `노트 ${book.notesCount || 0}개 · 인용구 ${book.quotesCount || 0}개`,
  }));
}

export function transformNotes(
  notes?: UnifiedSearchNoteItem[]
): TransformedNoteItem[] {
  if (!notes) return [];
  return notes.map((note) => ({
    id: note.id,
    title: note.title,
    bookTitle: note.bookTitle || "알 수 없음",
    snippet: note.snippet || note.content?.substring(0, 100) + "..." || "",
  }));
}

export function transformQuotes(
  quotes?: UnifiedSearchQuoteItem[]
): TransformedQuoteItem[] {
  if (!quotes) return [];
  return quotes.map((quote) => {
    const metaParts: string[] = [];
    if (quote.page) metaParts.push(`p.${quote.page}`);
    if (quote.chapter) metaParts.push(quote.chapter);
    return {
      id: quote.id,
      text: quote.text,
      bookTitle: quote.bookTitle || "알 수 없음",
      meta: metaParts.length > 0 ? metaParts.join(" · ") : "",
    };
  });
}

