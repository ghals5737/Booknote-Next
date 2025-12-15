"use client";

import { highlightText } from "@/lib/utils/highlight";
import { FileText } from "lucide-react";
import { useMemo } from "react";

type NoteItem = {
  id: string;
  title: string;
  bookTitle: string;
  snippet: string;
};

type NoteSearchSectionProps = {
  items: NoteItem[];
  query?: string;
};

export function NoteSearchSection({ items, query = "" }: NoteSearchSectionProps) {
  // 하이라이팅된 아이템들을 메모이제이션
  const highlightedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      highlightedTitle: highlightText(item.title, query),
      highlightedBookTitle: highlightText(item.bookTitle, query),
      highlightedSnippet: highlightText(item.snippet, query),
    }));
  }, [items, query]);
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">노트</h3>
      <div className="space-y-1.5">
        {highlightedItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-secondary/60">
              <FileText className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {item.highlightedTitle}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.highlightedBookTitle}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.highlightedSnippet}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
  