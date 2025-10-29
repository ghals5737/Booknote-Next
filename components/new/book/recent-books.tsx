import { BookCard } from "@/components/new/book/book-card"

const recentBooks = [
  {
    id: 1,
    title: "아토믹 해빗",
    author: "제임스 클리어",
    cover: "https://shopping-phinf.pstatic.net/main_5642510/56425107616.20250826081238.jpg",
    progress: 75,
    currentPage: 240,
    totalPages: 320,
    note: "12개 노트",
  },
  {
    id: 2,
    title: "클린 코드",
    author: "로버트 C. 마틴",
    cover: "https://shopping-phinf.pstatic.net/main_5589735/55897358373.20250723101012.jpg",
    progress: 45,
    currentPage: 208,
    totalPages: 464,
    note: "8개 노트",
  },
  {
    id: 3,
    title: "사피엔스",
    author: "유발 하라리",
    cover: "https://shopping-phinf.pstatic.net/main_5675573/56755736555.20250918101444.jpg",
    progress: 90,
    currentPage: 461,
    totalPages: 512,
    note: "2개 노트",
  },
]

export function RecentBooks() {
  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">최근 읽은 책</h2>
        <a href="#" className="text-sm font-medium text-primary hover:underline">
          전체 보기
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentBooks.map((book) => (
          <BookCard key={book.id} book={book} variant="recent" />
        ))}
      </div>
    </div>
  )
}
