"use client"

import { LibraryBookCard } from "@/components/book/library-book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Plus, Search, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BOOK_CATEGORY_IDS, BOOK_CATEGORY_LABELS, UserBookResponse } from "../../lib/types/book/book"

const CATEGORY_DEFINITIONS = [
  { id: "all", label: "전체" },
  ...BOOK_CATEGORY_IDS.map((id) => ({
    id,
    label: BOOK_CATEGORY_LABELS[id],
  })),
]


export function MyLibrary({ books }: { books: UserBookResponse[] }) {
  const [activeCategory, setActiveCategory] = useState("all")
  const router = useRouter()

  const searchByBookmark = () => {
    console.log("searchByBookmark")
  }
  
  const categories = CATEGORY_DEFINITIONS.map((category) => {
    if (category.id === "all") {
      return {
        ...category,
        count: books.length,
      }
    }

    return {
      ...category,
      count: books.filter((book) => book.category === category.id).length,
    }
  })

  const filteredBooks =
    activeCategory === "all"
      ? books
      : books.filter((book) => book.category === activeCategory)
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">내 서재</h2>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => router.push('/book/add')}>            
              <Plus className="mr-2 h-4 w-4" />
              책 추가
          </Button>          
          <Button variant="outline" size="sm" onClick={() => searchByBookmark() }>
            <Bookmark className="mr-2 h-4 w-4" />
            북마크 보기 
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            필터
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="책 제목이나 저자로 검색..." className="pl-10" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories
          .filter((category) => category.id === "all" || category.count > 0)
          .map((category) => (
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
        {filteredBooks.map((book) => (
          <LibraryBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
