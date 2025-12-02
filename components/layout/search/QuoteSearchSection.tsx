"use client";

import { Quote } from "lucide-react";

type QuoteItem = {
  id: string;
  text: string;
  bookTitle: string;
  meta: string;
};

type QuoteSearchSectionProps = {
  items: QuoteItem[];
};

export function QuoteSearchSection({ items }: QuoteSearchSectionProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">인용구</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-amber-100/70">
              <Quote className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{item.text}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.bookTitle} · {item.meta}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}