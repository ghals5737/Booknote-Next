"use client"

import { Card } from "@/components/ui/card"
import { NoteData, QuoteData } from "@/lib/types/book/book"
import { Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"


export function BookDetailTabs({ bookId, noteCount, quoteCount, notes, quotes }: { bookId: number, noteCount: number, quoteCount: number, notes: NoteData[], quotes: QuoteData[] }) {
  const [activeTab, setActiveTab] = useState<"notes" | "highlights" | "info">("notes")

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
            <Link key={note.id} href={`/note/${bookId}/${note.id}`}>
              <Card className="p-6 transition-shadow hover:shadow-md mb-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{note.title}</h3>
                    {note.isImportant && <span className="text-sm text-red-500">★ 중요</span>}
                  </div>
                  <span className="text-sm text-muted-foreground">p.{note.page}</span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{note.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {note.tagList.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{note.date}</span>
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
              {quote.isImportant && (
                <div className="mb-3 flex items-center gap-2 text-sm text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-600" />
                  <span className="font-medium">중요 인용구</span>
                </div>
              )}
              <blockquote className="mb-4 border-l-4 border-muted pl-4 text-base leading-relaxed">
                {quote.content}
              </blockquote>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{quote.page}페이지</span>
                <span className="text-xs text-muted-foreground">{quote.date}</span>
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
          <p className="text-muted-foreground">책 정보가 여기에 표시됩니다.</p>
        </Card>
      )}
    </>
  )
}
