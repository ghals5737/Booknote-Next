"use client"

import { BookCard } from "@/components/book/book-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Quote, Search, SearchX, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type SearchResultType = "BOOK" | "NOTE" | "QUOTE"

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  content?: string
  image?: string
  subTitle?: string
  date?: string
  page?: number
  bookId?: number
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "1",
    type: "BOOK",
    title: "아토믹 해빗",
    subTitle: "제임스 클리어",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    type: "BOOK",
    title: "데미안",
    subTitle: "헤르만 헤세",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    type: "NOTE",
    title: "습관 형성의 4단계",
    content: "습관은 작은 행동의 반복으로 만들어집니다. 신호, 갈망, 반응, 보상의 4단계를 통해...",
    subTitle: "아토믹 해빗",
    date: "2024-01-15",
    bookId: 1,
  },
  {
    id: "4",
    type: "NOTE",
    title: "성장 마인드셋의 중요성",
    content: "고정 마인드셋과 성장 마인드셋의 차이를 이해하는 것이 중요합니다...",
    subTitle: "마인드셋",
    date: "2024-01-10",
    bookId: 2,
  },
  {
    id: "5",
    type: "QUOTE",
    title: "삶은 속도가 아니라 방향이다",
    content: "삶은 속도가 아니라 방향이다. 중요한 것은 얼마나 빨리 가는가가 아니라 어디로 가는가이다.",
    subTitle: "데미안",
    page: 45,
    bookId: 1,
  },
  {
    id: "6",
    type: "QUOTE",
    title: "인생에서 가장 큰 영광은",
    content: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라 넘어질 때마다 일어서는 것이다.",
    subTitle: "넬슨 만델라 자서전",
    page: 120,
    bookId: 3,
  },
]

export function SearchClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeTab, setActiveTab] = useState("전체")

  // Debounce 처리 (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 검색 결과 필터링
  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return []
    }

    let results = MOCK_RESULTS.filter((result) => {
      const query = debouncedQuery.toLowerCase()
      return (
        result.title.toLowerCase().includes(query) ||
        result.subTitle?.toLowerCase().includes(query) ||
        result.content?.toLowerCase().includes(query)
      )
    })

    // 탭별 필터링
    if (activeTab === "책") {
      results = results.filter((r) => r.type === "BOOK")
    } else if (activeTab === "노트") {
      results = results.filter((r) => r.type === "NOTE")
    } else if (activeTab === "인용구") {
      results = results.filter((r) => r.type === "QUOTE")
    }

    return results
  }, [debouncedQuery, activeTab])

  const hasResults = filteredResults.length > 0
  const hasQuery = debouncedQuery.trim().length > 0

  const handleClear = () => {
    setSearchQuery("")
    setDebouncedQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="책, 노트, 인용구를 검색하세요..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-14 pl-12 pr-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {hasQuery && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="전체">전체</TabsTrigger>
            <TabsTrigger value="책">책</TabsTrigger>
            <TabsTrigger value="노트">노트</TabsTrigger>
            <TabsTrigger value="인용구">인용구</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            {/* Results are rendered below */}
          </TabsContent>
        </Tabs>
      )}

      {/* Search Results */}
      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            검색어를 입력해주세요
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            책, 노트, 인용구를 통합 검색할 수 있습니다
          </p>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            검색 결과가 없습니다
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            다른 검색어로 시도해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{filteredResults.length}개</span>의 결과를 찾았습니다
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((result) => {
              if (result.type === "BOOK") {
                return (
                  <div key={result.id}>
                    <BookCard
                      book={{
                        id: parseInt(result.id),
                        title: result.title,
                        author: result.subTitle || "",
                        cover: result.image || "/placeholder.svg",
                        progress: 0,
                        currentPage: 0,
                        totalPages: 0,
                        note: "",
                      }}
                    />
                  </div>
                )
              }

              if (result.type === "NOTE") {
                return (
                  <Link key={result.id} href={`/book/${result.bookId}/note/${result.id}`}>
                    <Card className="hover:shadow-lg transition-all h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 line-clamp-1">
                              {result.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {result.subTitle}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {result.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{result.date}</span>
                          <Badge variant="secondary">노트</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }

              if (result.type === "QUOTE") {
                return (
                  <Link key={result.id} href={`/book/${result.bookId}`}>
                    <Card className="hover:shadow-lg transition-all h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <Quote className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 line-clamp-1">
                              {result.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {result.subTitle}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-sm italic line-clamp-3">
                            &quot;{result.content}&quot;
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {result.page && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {result.page}p
                            </span>
                          )}
                          <Badge variant="secondary">인용구</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }

              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

