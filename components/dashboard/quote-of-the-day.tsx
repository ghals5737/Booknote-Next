'use client';

import { Quote } from 'lucide-react';

interface QuoteOfTheDayProps {
  quote: string;
  author: string;
  bookTitle?: string;
}

export function QuoteOfTheDay({ quote, author, bookTitle }: QuoteOfTheDayProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-border bg-gradient-to-br from-card to-secondary/30 p-6 shadow-md">
      {/* 장식용 따옴표 */}
      <Quote className="absolute right-4 top-4 h-16 w-16 text-border/50" />
      
      <div className="relative z-10">
        <p className="mb-3 text-lg leading-relaxed text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="text-sm text-muted-foreground">
          <span>— {author}</span>
          {bookTitle && <span className="ml-2">『{bookTitle}』</span>}
        </div>
      </div>
    </div>
  );
}

