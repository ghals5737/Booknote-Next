'use client';

import { Quote } from 'lucide-react';

interface QuoteOfTheDayProps {
  quote: string;
  author: string;
  bookTitle?: string;
}

export function QuoteOfTheDay({ quote, author, bookTitle }: QuoteOfTheDayProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-card to-secondary/30 p-8 shadow-md">
      {/* 큰 세리프 인용 부호 배경 워터마크 */}
      <div className="absolute left-4 top-4 font-serif text-[120px] leading-none text-primary/5 pointer-events-none">
        &ldquo;
      </div>
      
      {/* 우측 하단 작은 Quote 아이콘 장식 */}
      <Quote className="absolute bottom-4 right-4 h-8 w-8 text-primary/20" />
      
      <div className="relative z-10">
        <p className="mb-3 font-serif text-lg italic leading-relaxed text-foreground">
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

