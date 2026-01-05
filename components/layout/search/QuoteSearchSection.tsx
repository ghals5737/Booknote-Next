"use client";

import { highlightText } from "@/lib/utils/highlight";
import { Quote } from "lucide-react";
import { useMemo, useState } from "react";

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

const PREVIEW_LIMIT = 3;

export function QuoteSearchSection({
  items,
  query = "",
  selectedIndex,
  indexRange,
  onItemClick,
}: QuoteSearchSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // 하이라이팅된 아이템들을 메모이제이션
  const highlightedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      highlightedText: highlightText(item.text, query),
      highlightedBookTitle: highlightText(item.bookTitle, query),
    }));
  }, [items, query]);
  
  if (!items.length) return null;

  const displayItems = expanded ? highlightedItems : highlightedItems.slice(0, PREVIEW_LIMIT);

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Quote className="h-4 w-4 text-[#D4A574]" />
        인용구 ({items.length})
      </h3>
      <div className="space-y-2">
        {displayItems.map((item, localIndex) => {
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
              className={`group w-full rounded-xl border border-border/50 bg-card/30 p-3 sm:p-4 text-left backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background ${
                isSelected ? "border-primary/50 bg-card/50 ring-2 ring-primary/50" : ""
              }`}
              title="인용구 상세 화면으로 이동"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Quote className="h-4 w-4 text-[#D4A574]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1">
                    <span className="font-medium font-serif text-foreground">
                      {item.highlightedText}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.highlightedBookTitle} · {item.meta}
                  </p>
                </div>
                {/* 호버 시 화살표 */}
                <div className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {items.length > PREVIEW_LIMIT && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full rounded-lg border border-border/50 bg-card/20 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-card/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {expanded ? "접기" : `${items.length - PREVIEW_LIMIT}개 더보기`}
        </button>
      )}
    </div>
  );
}