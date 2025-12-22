"use client";

import { highlightText } from "@/lib/utils/highlight";
import { FileText } from "lucide-react";
import { useMemo } from "react";

type NoteItem = {
  id: string;
  bookId: string;
  title: string;
  bookTitle: string;
  snippet: string;
};

type NoteSearchSectionProps = {
  items: NoteItem[];
  query?: string;
  selectedIndex: number;
  indexRange: { start: number; end: number };
  onItemClick: (item: { type: "note"; id: string; bookId: string }) => void;
};

export function NoteSearchSection({
  items,
  query = "",
  selectedIndex,
  indexRange,
  onItemClick,
}: NoteSearchSectionProps) {
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
        {highlightedItems.map((item, localIndex) => {
          const globalIndex = indexRange.start + localIndex;
          const isSelected = selectedIndex === globalIndex;
          return (
            <button
              key={item.id}
              type="button"
              data-item-index={globalIndex}
              onClick={() =>
                onItemClick({ type: "note", id: item.id, bookId: item.bookId })
              }
              className={`w-full flex items-start gap-2 sm:gap-3 rounded-lg px-3 sm:px-3 py-2.5 sm:py-2 cursor-pointer text-left transition-all duration-200 ${
                isSelected
                  ? "bg-primary/10 ring-2 ring-primary/20"
                  : "hover:bg-muted/80 active:bg-muted/60"
              }`}
            >
              <div className="mt-0.5 flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-secondary/60 flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-4 sm:h-4 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p className="truncate text-sm sm:text-sm font-medium leading-tight">
                  {item.highlightedTitle}
                </p>
                <p className="text-[11px] sm:text-[11px] text-muted-foreground truncate mt-0.5">
                  {item.highlightedBookTitle}
                </p>
                <p className="text-[11px] sm:text-[11px] text-muted-foreground truncate mt-0.5 line-clamp-1">
                  {item.highlightedSnippet}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
  