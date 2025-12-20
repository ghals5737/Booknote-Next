"use client"

import { Markdown } from "@/components/note/Markdown"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookDetailData } from "@/lib/types/book/book"
import { NoteResponse } from "@/lib/types/note/note"
import { ArrowLeft, BookOpen, Copy, Edit, Share2, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NoteDetailClient({ noteDetail, bookDetail }: { noteDetail: NoteResponse, bookDetail: BookDetailData }) {
  const router = useRouter()
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
        router.push(`/book/${bookDetail.id}`)
      } else {
        alert("노트 삭제에 실패했습니다.")
      }
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/book/${bookDetail.id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bookDetail.title}</span>
              <span className="text-muted-foreground">•</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {noteDetail.isImportant ? (
                <>
                  <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  중요 해제
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  중요 표시
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              복사
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
          </div>
        </div>

        {/* Note Content Card */}
        <Card className="mb-6 p-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-balance">{noteDetail.title}</h1>
              {noteDetail.isImportant && (
                <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  중요
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                편집
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                onClick={(e) => handleDeleteNote(e, noteDetail.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span>📅</span>
            <span>작성: {noteDetail.startDate}</span>
          </div>

          {/* <p className="mb-6 text-base leading-relaxed">{noteDetail.content}</p> */}
          <Markdown content={noteDetail.content} />
          <div className="border-t pt-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>🏷️</span>
              <span>태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {noteDetail.tagList.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Related Book Section */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">이 노트가 속한 책</h2>
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow">
              <Image src={bookDetail.coverImage || "/placeholder.svg"} alt={bookDetail.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold">{bookDetail.title}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{bookDetail.author}</p>
              <Link href={`/book/${bookDetail.id}`}>
                <Button variant="outline" size="sm">
                  책 상세보기
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}