"use client"

import { LibraryBookCard } from "@/components/new/book/library-book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

const categories = [
  { id: "all", label: "전체", count: 6 },
  { id: "self-help", label: "자기계발", count: 2 },
  { id: "dev", label: "개발", count: 1 },
  { id: "history", label: "역사", count: 1 },
  { id: "novel", label: "소설", count: 1 },
  { id: "psychology", label: "심리학", count: 1 },
]

const books = [
  {
    id: 1,
    title: "아토믹 해빗",
    author: "제임스 클리어",
    category: "자기계발",
    categoryColor: "bg-blue-100 text-blue-700",
    cover: "/atomic-habits-cover.png",
    rating: 5,
    progress: 75,
    note: "12개 노트",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "클린 코드",
    author: "로버트 C. 마틴",
    category: "개발",
    categoryColor: "bg-green-100 text-green-700",
    cover: "/clean-code-book-cover-programming.jpg",
    rating: 4.5,
    progress: 45,
    note: "8개 노트",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "사피엔스",
    author: "유발 하라리",
    category: "역사",
    categoryColor: "bg-yellow-100 text-yellow-700",
    cover: "/sapiens-book-cover-human-evolution.jpg",
    rating: 5,
    progress: 90,
    note: "2개 노트",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "데일 카네기 인간관계론",
    author: "데일 카네기",
    category: "자기계발",
    categoryColor: "bg-blue-100 text-blue-700",
    cover: "/how-to-win-friends-influence-people.jpg",
    rating: 4,
    progress: 30,
    note: "5개 노트",
    date: "2024-01-12",
  },
  {
    id: 5,
    title: "1984",
    author: "조지 오웰",
    category: "소설",
    categoryColor: "bg-red-100 text-red-700",
    cover: "/1984-book-cover.png",
    rating: 5,
    progress: 60,
    note: "15개 노트",
    date: "2024-01-11",
  },
  {
    id: 6,
    title: "생각, 빠르고 느리게",
    author: "대니얼 카너먼",
    category: "심리학",
    categoryColor: "bg-purple-100 text-purple-700",
    cover: "/thinking-fast-and-slow-brain.jpg",
    rating: 4.5,
    progress: 20,
    note: "7개 노트",
    date: "2024-01-10",
  },
]

export function MyLibrary() {
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
