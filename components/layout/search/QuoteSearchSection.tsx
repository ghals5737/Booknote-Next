"use client";

import { highlightText } from "@/lib/utils/highlight";
import { Quote } from "lucide-react";
import { useMemo } from "react";

type QuoteItem = {
  id: string;
  text: string;
  bookTitle: string;
  meta: string;
};

type QuoteSearchSectionProps = {
  items: QuoteItem[];
  query?: string;
};

export function QuoteSearchSection({ items, query = "" }: QuoteSearchSectionProps) {
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
        {highlightedItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-amber-100/70">
              <Quote className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">
                {item.highlightedText}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.highlightedBookTitle} · {item.meta}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}