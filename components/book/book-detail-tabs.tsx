"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BOOK_CATEGORY_LABELS, BookDetailData } from "@/lib/types/book/book"
import { NoteResponse } from "@/lib/types/note/note"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { formatKoreanDate, formatRelativeDate } from "@/lib/utils"
import { BookOpen, Calendar, Edit3, Quote, Star } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Markdown } from "../note/Markdown"


export function BookDetailTabs({ bookId, noteCount, quoteCount, initialNotes, initialQuotes, bookDetail }: { bookId: number, noteCount: number, quoteCount: number, initialNotes: NoteResponse[], initialQuotes: QuoteResponse[], bookDetail: BookDetailData }) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const getInitialTab = (param: string | null): "notes" | "highlights" | "info" => {
    if (param === "highlights" || param === "quotes") return "highlights"
    if (param === "info") return "info"
    return "notes"
  }
  
  const [activeTab, setActiveTab] = useState<"notes" | "highlights" | "info">(getInitialTab(tabParam))
  
  // URL 파라미터가 변경되면 탭 업데이트
  useEffect(() => {
    setActiveTab(getInitialTab(tabParam))
  }, [tabParam])
  const [notes, setNotes] = useState<NoteResponse[]>(initialNotes)
  const [quotes, setQuotes] = useState<QuoteResponse[]>(initialQuotes)
  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("이 노트를 삭제하시겠습니까?")) {
      console.log("[v0] Deleting note:", noteId)
      const response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        alert("노트가 삭제되었습니다.")
        setNotes(prev => prev.filter((note) => note.id !== noteId))
      } else {
        alert("노트 삭제에 실패했습니다.")
      }
    }
  }

  const handleDeleteQuote = async (e: React.MouseEvent, quoteId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("이 인용구를 삭제하시겠습니까?")) {
      console.log("[v0] Deleting quote:", quoteId)
      const response = await fetch(`/api/v1/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        alert("인용구가 삭제되었습니다.")
        setQuotes(prev => prev.filter((quote) => quote.id !== quoteId))
      } else {
        alert("인용구 삭제에 실패했습니다.")
    }
  }
}

  return (
    <>
      <div className="mb-6 border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 font-medium transition-colors ${
              activeTab === "notes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            노트 ({noteCount})
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`pb-3 font-medium transition-colors ${
              activeTab === "highlights"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            인용구 ({quoteCount})
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 font-medium transition-colors ${
              activeTab === "info"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            책 정보
          </button>
        </div>
      </div>

      {activeTab === "notes" && (
        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id} className="rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-200 hover:border-border hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(note.updateDate || note.startDate)}
                  </span>
                  {('page' in note && typeof (note as NoteResponse & { page?: number }).page === 'number' && (note as NoteResponse & { page?: number }).page) ? (
                    <span className="text-xs font-medium text-primary">페이지 {(note as NoteResponse & { page?: number }).page}</span>
                  ) : null}
                </div>
                <div className="mb-3">
                  <Markdown content={note.content} disableInternalLinks />
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/book/${bookId}/note/${note.id}/edit`}
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    수정
                  </Link>
                  <span className="text-xs text-muted-foreground">·</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteNote(e, note.id);
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
              <Edit3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-2 font-medium">아직 작성한 노트가 없습니다</p>
              <p className="mb-6 text-sm text-muted-foreground">
                책을 읽으며 떠오르는 생각을 기록해보세요
              </p>
              <Link href={`/book/${bookId}/note/new`}>
                <Button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90">
                  첫 노트 작성하기
                </Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {activeTab === "highlights" && (
        <div className="space-y-4">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <Card key={quote.id} className="rounded-xl border border-amber-600/20 bg-gradient-to-br from-amber-50/50 to-card/50 p-6 transition-all duration-200 hover:border-amber-600/30 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(
                      ('createdAt' in quote && typeof (quote as QuoteResponse & { createdAt?: string }).createdAt === 'string' 
                        ? (quote as QuoteResponse & { createdAt?: string }).createdAt 
                        : null) || 
                      ('updateDate' in quote && typeof (quote as QuoteResponse & { updateDate?: string }).updateDate === 'string' 
                        ? (quote as QuoteResponse & { updateDate?: string }).updateDate 
                        : null) || 
                      null
                    )}
                  </span>
                  <span className="text-xs font-medium text-amber-700">페이지 {quote.page || '-'}</span>
                </div>
                <div className="relative mb-3 pl-4">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-amber-600/30"></div>
                  <p className="font-serif italic leading-relaxed text-foreground">
                    &ldquo;{quote.content}&rdquo;
                  </p>
                </div>
                {quote.memo && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {quote.memo}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/book/${bookId}/quote/${quote.id}/edit`}
                    className="text-xs text-amber-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    수정
                  </Link>
                  <span className="text-xs text-muted-foreground">·</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteQuote(e, quote.id);
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
              <Quote className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-2 font-medium">아직 저장한 인용구가 없습니다</p>
              <p className="mb-6 text-sm text-muted-foreground">
                마음에 드는 구절을 저장해보세요
              </p>
              <Link href={`/book/${bookId}/quote/new`}>
                <Button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90">
                  첫 인용구 추가하기
                </Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-6">
          {/* 기본 정보 그리드 */}
          <div className="grid gap-6 rounded-xl border border-border/50 bg-card/50 p-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm text-muted-foreground">제목</h3>
                <p className="font-medium">{bookDetail.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Edit3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm text-muted-foreground">저자</h3>
                <p className="font-medium">{bookDetail.author}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm text-muted-foreground">카테고리</h3>
                <p className="font-medium">
                  {bookDetail.category ? (BOOK_CATEGORY_LABELS[bookDetail.category as keyof typeof BOOK_CATEGORY_LABELS] || bookDetail.category) : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm text-muted-foreground">출판일</h3>
                <p className="font-medium">{bookDetail.pubdate ? formatKoreanDate(bookDetail.pubdate) : "-"}</p>
              </div>
            </div>
          </div>

          {/* 출판 정보 */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <h3 className="mb-4 font-bold tracking-tight">출판 정보</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">출판사</p>
                <p className="font-medium">{bookDetail.publisher || "-"}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">페이지</p>
                <p className="font-medium">{bookDetail.totalPages > 0 ? `${bookDetail.totalPages}쪽` : "-"}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">ISBN</p>
                <p className="font-medium">{bookDetail.isbn || "-"}</p>
              </div>
            </div>
          </div>

          {/* 책 소개 */}
          {bookDetail.description && (
            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary/30 to-card/50 p-6">
              <h3 className="mb-4 font-bold tracking-tight">책 소개</h3>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {bookDetail.description}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
