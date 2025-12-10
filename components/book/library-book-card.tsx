import { Card } from "@/components/ui/card"
import { BOOK_CATEGORY_LABELS, UserBookResponse } from "@/lib/types/book/book"
import { Star } from "lucide-react"
import moment from "moment"
import Image from "next/image"
import Link from "next/link"

export function LibraryBookCard({ book }: { book: UserBookResponse }) {
  const fullStars = Math.floor(book.rating || 0)
  const hasHalfStar = (book.rating || 0) % 1 !== 0
  const categoryLabel = BOOK_CATEGORY_LABELS[book.category as keyof typeof BOOK_CATEGORY_LABELS] ?? book.category

  return (
    <Link href={`/book/${book.id}`}>
    <Card className="overflow-hidden transition-all hover:shadow-lg w-[260px]">
      <div className="relative  h-[336px] w-[260px] mx-auto overflow-hidden bg-muted">
        <Image src={book.coverImage || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-balance">{book.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{book.author}</p>
        <div className="flex items-center justify-between">
        <div className="mb-3">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium `}>
            {categoryLabel}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          {hasHalfStar && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: "inset(0 50% 0 0)" }} />
          )}
          {[...Array(5 - Math.ceil(book.rating || 0))].map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        </div>

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
    </Card>
    </Link>
  )
}
