'use client';

import { Bookmark, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  progress: number;
  rating: number;
  noteCount: number;
}

export function BookCard({ id, title, author, cover, progress, rating, noteCount }: BookCardProps) {
  return (
    <Link href={`/book/${id}`} className="group relative">
      {/* 책 표지 */}
      <div className="relative mb-3 overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              {title.charAt(0)}
            </div>
          )}
        </div>
        
        {/* 진행률 표시 - 북마크 스타일 */}
        {progress > 0 && progress < 100 && (
          <div className="absolute right-2 top-0">
            <div className="relative">
              <Bookmark className="h-10 w-8 fill-primary text-primary" />
              <span className="absolute inset-0 flex items-center justify-center pt-1 text-xs text-primary-foreground font-semibold">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 책 정보 */}
      <div className="space-y-1">
        <h3 className="font-semibold line-clamp-2 leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{author}</p>
        
        {/* 별점 & 노트 수 */}
        <div className="flex items-center gap-3 pt-1">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < rating 
                      ? 'fill-primary text-primary' 
                      : 'fill-transparent text-border'
                  }`}
                />
              ))}
            </div>
          )}
          
          {noteCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>{noteCount}</span>
            </div>
          )}
        </div>

        {/* 읽기 진행률 바 */}
        {progress > 0 && (
          <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

