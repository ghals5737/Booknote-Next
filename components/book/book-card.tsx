import { Card } from "@/components/ui/card"
import Image from "next/image"

interface BookCardProps {
  book: {
    title: string
    author: string
    cover: string
    progress: number
    currentPage: number
    totalPages: number
    note: string
  }
  variant?: "recent" | "library"
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg p-0">
      <div className="flex gap-4 p-4">
        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md">
          <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="mb-1 font-semibold text-balance">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{book.note}</span>
              <span className="font-medium text-foreground">{book.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${book.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {book.currentPage}/{book.totalPages}p
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
