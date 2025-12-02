"use client";

import { BookOpen } from "lucide-react";

type BookItem = {
  id: string;
  title: string;
  author: string;
  meta: string;
};

type BookSearchSectionProps = {
  items: BookItem[];
};

export function BookSearchSection({ items }: BookSearchSectionProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">책</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.author} · {item.meta}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}