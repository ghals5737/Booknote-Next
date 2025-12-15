import { SearchClient } from "./SearchClient"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">검색</h1>
          <p className="text-muted-foreground">
            책, 노트, 인용구를 통합 검색할 수 있습니다
          </p>
        </div>
        <SearchClient />
      </main>
    </div>
  )
}

