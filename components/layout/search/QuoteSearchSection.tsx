"use client";

import { highlightText } from "@/lib/utils/highlight";
import { Quote } from "lucide-react";
import { useMemo } from "react";

type QuoteItem = {
  id: string;
  bookId: string;
  text: string;
  bookTitle: string;
  meta: string;
};

type QuoteSearchSectionProps = {
  items: QuoteItem[];
  query?: string;
  selectedIndex: number;
  indexRange: { start: number; end: number };
  onItemClick: (item: { type: "quote"; id: string; bookId: string }) => void;
};

export function QuoteSearchSection({
  items,
  query = "",
  selectedIndex,
  indexRange,
  onItemClick,
}: QuoteSearchSectionProps) {
  // 하이라이팅된 아이템들을 메모이제이션
  const highlightedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      highlightedText: highlightText(item.text, query),
      highlightedBookTitle: highlightText(item.bookTitle, query),
    }));
  }, [items, query]);
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">인용구</h3>
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
                onItemClick({ type: "quote", id: item.id, bookId: item.bookId })
              }
              className={`w-full flex items-start gap-2 sm:gap-3 rounded-lg px-3 sm:px-3 py-2.5 sm:py-2 cursor-pointer text-left transition-all duration-200 ${
                isSelected
                  ? "bg-primary/10 ring-2 ring-primary/20"
                  : "hover:bg-muted/80 active:bg-muted/60"
              }`}
            >
              <div className="mt-0.5 flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-amber-100/70 flex-shrink-0">
                <Quote className="w-4 h-4 sm:w-4 sm:h-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-sm sm:text-sm font-medium line-clamp-2 leading-tight">
                  {item.highlightedText}
                </p>
                <p className="text-[11px] sm:text-[11px] text-muted-foreground truncate mt-0.5">
                  {item.highlightedBookTitle} · {item.meta}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}