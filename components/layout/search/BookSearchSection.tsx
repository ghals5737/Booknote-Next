"use client";

import { highlightText } from "@/lib/utils/highlight";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";

type BookItem = {
  id: string;
  title: string;
  author: string;
  meta: string;
};

type BookSearchSectionProps = {
  items: BookItem[];
  query?: string;
};

export function BookSearchSection({ items, query = "" }: BookSearchSectionProps) {
  // 하이라이팅된 아이템들을 메모이제이션 (검색어나 아이템이 변경될 때만 재계산)
  const highlightedItems = useMemo(() => {
    if (!items.length) return [];
    return items.map((item) => ({
      ...item,
      highlightedTitle: highlightText(item.title, query),
      highlightedAuthor: highlightText(item.author, query),
    }));
  }, [items, query]);

  if (!items.length) return null; 

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">책</h3>
      <div className="space-y-1.5">
        {highlightedItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {item.highlightedTitle}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.highlightedAuthor} · {item.meta}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}