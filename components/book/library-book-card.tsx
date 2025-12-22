"use client";

import { StarRatingInput } from "@/components/book/star-rating-input";
import { Card } from "@/components/ui/card";
import { BOOK_CATEGORY_LABELS, UserBookResponse } from "@/lib/types/book/book";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

export function LibraryBookCard({ book }: { book: UserBookResponse }) {
  const categoryLabel = BOOK_CATEGORY_LABELS[book.category as keyof typeof BOOK_CATEGORY_LABELS] ?? book.category

  return (
    <Link href={`/book/${book.id}`} className="h-full">
    <Card className="overflow-hidden transition-all hover:shadow-lg w-full h-full flex flex-col">
      <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '260/235' }}>
        <Image src={book.coverImage || "/placeholder.svg"} alt={book.title} fill className="object-cover object-top" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="mb-3">
            <h3 className="mb-1 font-semibold text-balance line-clamp-2 h-[3rem] leading-6 break-keep">{book.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
          </div>
          <div className="flex items-center justify-between h-8 mb-3">
          <div className="flex items-center h-8">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {categoryLabel}
            </span>
          </div>

          <div 
            className="flex items-center h-8 w-[100px] justify-end"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <StarRatingInput
              bookId={Number(book.id)}
              initialRating={book.rating || 0}
              size="sm"
              showLabel={false}
              refreshOnUpdate={true}
            />
          </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${book.progress}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{book.currentPage}/{book.totalPages}p</span>
            <span className="font-medium text-foreground">{book.progress}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div></div>
          <p className="mt-2 text-xs text-muted-foreground">{moment(book.startDate).format('YYYY.MM.DD')} ~ {moment(book.updateDate).format('YYYY.MM.DD')}</p>
          </div>
        </div>
      </div>
    </Card>
    </Link>
  )
}
