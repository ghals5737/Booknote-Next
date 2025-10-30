import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import { UserBookResponse } from "../../../lib/types/book/book"

export function LibraryBookCard({ book }: { book: UserBookResponse }) {
  const fullStars = Math.floor(book.rating)
  const hasHalfStar = book.rating % 1 !== 0

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-balance">{book.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{book.author}</p>

        <div className="mb-3">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${book.categoryColor}`}>
            {book.category}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          {hasHalfStar && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" style={{ clipPath: "inset(0 50% 0 0)" }} />
          )}
          {[...Array(5 - Math.ceil(book.rating))].map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
          ))}
        </div>

        <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${book.progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{book.note}</span>
          <span className="font-medium text-foreground">{book.progress}%</span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">{book.date}</p>
      </div>
    </Card>
  )
}
