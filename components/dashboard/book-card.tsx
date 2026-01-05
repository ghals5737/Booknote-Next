'use client';

import { FileText, Quote, Star } from 'lucide-react';
import Image from 'next/image';

interface BookCardProps {
  id?: number;
  title: string;
  author: string;
  cover: string;
  progress: number;
  rating: number;
  noteCount: number;
  quoteCount?: number;
  onClick?: () => void;
}

export function BookCard({ title, author, cover, progress, rating, noteCount, quoteCount, onClick }: BookCardProps) {
  return (
    <div 
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* 책 표지 */}
      <div className="relative mb-3 overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          {cover ? (
            <Image 
              src={cover} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              {title.charAt(0)}
            </div>
          )}
        </div>
        
        {/* 진행률 바 - 하단 */}
        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* 완독 오버레이 */}
        {progress === 100 && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#7A9B8E]/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-center pb-4">
            <span className="text-xs font-semibold text-white">완독</span>
          </div>
        )}
      </div>

      {/* 책 정보 */}
      <div className="space-y-1.5">
        <h3 className="font-serif line-clamp-2 leading-snug transition-colors duration-200">{title}</h3>
        <p className="text-sm text-muted-foreground/80">{author}</p>
        
        {/* 메타 정보 - hover시에만 표시 */}
        <div className="flex min-h-[20px] items-center gap-3 pt-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">{rating}</span>
            </div>
          )}
          
          {noteCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <FileText className="h-3 w-3" />
              <span>{noteCount}</span>
            </div>
          )}
          
          {quoteCount != null && quoteCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <Quote className="h-3 w-3" />
              <span>{quoteCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

