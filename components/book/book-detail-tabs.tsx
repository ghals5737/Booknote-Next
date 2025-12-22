"use client"

import { Card } from "@/components/ui/card"
import { BookDetailData } from "@/lib/types/book/book"
import { NoteResponse } from "@/lib/types/note/note"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { BOOK_CATEGORY_LABELS } from "@/lib/types/book/book"
import { formatDateYMD } from "@/lib/utils"
import { Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Markdown } from "../note/Markdown"


export function BookDetailTabs({ bookId, noteCount, quoteCount, initialNotes, initialQuotes, bookDetail }: { bookId: number, noteCount: number, quoteCount: number, initialNotes: NoteResponse[], initialQuotes: QuoteResponse[], bookDetail: BookDetailData }) {
  const [activeTab, setActiveTab] = useState<"notes" | "highlights" | "info">("notes")
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
      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            노트 ({noteCount})
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "highlights"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            인용구 ({quoteCount})
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
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
          {notes.map((note) => (
            <Link key={note.id} href={`/book/${bookId}/note/${note.id}`}>
              <Card className="p-6 transition-shadow hover:shadow-md mb-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{note.title}</h3>
                    {note.isImportant && <span className="text-sm text-red-500">★ 중요</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="노트 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{note.content}</p> */}
                <Markdown content={note.content} disableInternalLinks />
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {note.tagList.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateYMD(note.startDate)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "highlights" && (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="p-6 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
              <div>
              {quote.isImportant && (
                <div className="mb-3 flex items-center gap-2 text-sm text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-600" />
                  <span className="font-medium">중요 인용구</span>
                </div>
              )}
              </div>
               <button
                  onClick={(e) => handleDeleteQuote(e, quote.id)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="인용구 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <blockquote className="mb-4 border-l-4 border-muted pl-4 text-base leading-relaxed">
                {quote.content}
              </blockquote>
             
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{quote.page}페이지</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* {quote.tagList.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {tag}
                  </span>
                ))} */}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "info" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-xl font-semibold">기본 정보</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">제목</p>
                  <p className="mt-1 text-base">{bookDetail.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">저자</p>
                  <p className="mt-1 text-base">{bookDetail.author}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">출판사</p>
                  <p className="mt-1 text-base">{bookDetail.publisher || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">출판일</p>
                  <p className="mt-1 text-base">{bookDetail.pubdate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISBN</p>
                  <p className="mt-1 text-base">{bookDetail.isbn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">카테고리</p>
                  <p className="mt-1 text-base">
                    {bookDetail.category ? (BOOK_CATEGORY_LABELS[bookDetail.category as keyof typeof BOOK_CATEGORY_LABELS] || bookDetail.category) : "-"}
                  </p>
                </div>
              </div>
            </div>

            {bookDetail.description && (
              <div>
                <h3 className="mb-4 text-xl font-semibold">책 소개</h3>
                <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{bookDetail.description}</p>
              </div>
            )}

            <div>
              <h3 className="mb-4 text-xl font-semibold">읽기 정보</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">시작일</p>
                  <p className="mt-1 text-base">{bookDetail.startDate ? formatDateYMD(bookDetail.startDate) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">최근 업데이트</p>
                  <p className="mt-1 text-base">{bookDetail.updateDate ? formatDateYMD(bookDetail.updateDate) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">진행률</p>
                  <p className="mt-1 text-base">{bookDetail.progress}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">페이지</p>
                  <p className="mt-1 text-base">{bookDetail.currentPage} / {bookDetail.totalPages}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">평점</p>
                  <p className="mt-1 text-base">
                    {bookDetail.rating ? `${bookDetail.rating} / 5` : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
