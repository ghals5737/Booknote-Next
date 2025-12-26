"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookDetailData } from "@/lib/types/book/book"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { ArrowLeft, BookOpen, Copy, Edit, Share2, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function QuoteDetailClient({ quoteDetail, bookDetail }: { quoteDetail: QuoteResponse, bookDetail: BookDetailData }) {
  const router = useRouter()
  
  const handleDeleteQuote = async (e: React.MouseEvent, quoteId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("이 인용구를 삭제하시겠습니까?")) {
      console.log("[v0] Deleting quote:", quoteId)
      const response = await fetch(`/api/v1/quotes?id=${quoteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        alert("인용구가 삭제되었습니다.")
        router.push(`/book/${bookDetail.id}`)
      } else {
        alert("인용구 삭제에 실패했습니다.")
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
              {quoteDetail.isImportant ? (
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

        {/* Quote Content Card */}
        <Card className="mb-6 p-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {quoteDetail.isImportant && (
                <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  중요 인용구
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/book/${bookDetail.id}/quote/${quoteDetail.id}/update`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  편집
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                onClick={(e) => handleDeleteQuote(e, quoteDetail.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </div>
          </div>

          <blockquote className="mb-6 border-l-4 border-primary pl-6 text-lg leading-relaxed italic">
            &quot;{quoteDetail.content}&quot;
          </blockquote>

          {quoteDetail.memo && (
            <div className="mb-6 rounded-lg bg-muted p-4">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">메모</h3>
              <p className="text-base leading-relaxed">{quoteDetail.memo}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{quoteDetail.page}페이지</span>
            </div>
          </div>
        </Card>

        {/* Related Book Section */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">이 인용구가 속한 책</h2>
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

