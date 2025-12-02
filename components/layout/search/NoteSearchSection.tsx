"use client";

import { FileText } from "lucide-react";

type NoteItem = {
  id: string;
  title: string;
  bookTitle: string;
  snippet: string;
};

type NoteSearchSectionProps = {
  items: NoteItem[];
};

export function NoteSearchSection({ items }: NoteSearchSectionProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">노트</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full flex items-start gap-3 rounded-md px-3 py-2 hover:bg-muted/80 cursor-pointer text-left"
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-secondary/60">
              <FileText className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.bookTitle}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.snippet}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
  