"use client"

import { LibraryBookCard } from "@/components/new/book/library-book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import { UserBookResponse } from "../../../lib/types/book/book"

const categories = [
  { id: "all", label: "전체", count: 6 },
  { id: "self-help", label: "자기계발", count: 2 },
  { id: "dev", label: "개발", count: 1 },
  { id: "history", label: "역사", count: 1 },
  { id: "novel", label: "소설", count: 1 },
  { id: "psychology", label: "심리학", count: 1 },
]


export function MyLibrary({ books }: { books: UserBookResponse[] }) {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">내 서재</h2>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="책 제목이나 저자로 검색..." className="pl-10" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <LibraryBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
