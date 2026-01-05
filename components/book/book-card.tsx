"use client";

import { StarRatingInput } from "@/components/book/star-rating-input";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: {
    id: number;
    title: string
    author: string
    cover: string
    progress: number
    currentPage: number
    totalPages: number
    note: string
    rating?: number
  }
  variant?: "recent" | "library"
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`} className="h-full block">
    <Card className="overflow-hidden transition-all hover:shadow-lg p-0 h-full flex flex-col">
      <div className="flex gap-4 p-4 flex-1">
        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md">
          <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill sizes="96px" className="object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div className="min-h-[3.5rem]">
            <h3 className="mb-1 font-semibold line-clamp-2 leading-tight">{book.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{book.note}</span>
              <span className="font-medium text-foreground">{book.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${book.progress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {book.currentPage}/{book.totalPages}p
              </p>
              {book.rating !== undefined && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <StarRatingInput
                    bookId={book.id}
                    initialRating={book.rating || 0}
                    size="sm"
                    showLabel={false}
                    refreshOnUpdate={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
    </Link>
  )
}
