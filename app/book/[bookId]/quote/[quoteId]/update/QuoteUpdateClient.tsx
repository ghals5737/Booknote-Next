"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookDetailData } from "@/lib/types/book/book"
import { QuoteResponse } from "@/lib/types/quote/quote"
import { ArrowLeft, BookOpen, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface QuoteUpdateClientProps {
  bookId: string
  quoteId: string
  initialData: QuoteResponse
  bookDetail: BookDetailData
}

export default function QuoteUpdateClient({ bookId, quoteId, initialData, bookDetail }: QuoteUpdateClientProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialData.content)
  const [page, setPage] = useState(initialData.page.toString())
  const [memo, setMemo] = useState(initialData.memo || "")
  const [isImportant, setIsImportant] = useState(initialData.isImportant)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!content.trim()) {
      alert('인용구 내용을 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/v1/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          page: page ? parseInt(page, 10) : 0,
          memo: memo.trim(),
          isImportant: isImportant,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '인용구 수정에 실패했습니다.')
      }

      const result = await response.json()
      if (result.success) {
        alert('인용구가 성공적으로 수정되었습니다.')
        router.push(`/book/${bookId}/quote/${quoteId}`)
      } else {
        alert('인용구 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      alert(`인용구 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/book/${bookId}/quote/${quoteId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/book/${bookId}/quote/${quoteId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bookDetail.title}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">인용구 수정</span>
            </div>
          </div>
        </div>

        {/* Update Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>인용구 수정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">인용구 내용 *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="인용구 내용을 입력하세요..."
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Page */}
            <div className="space-y-2">
              <Label htmlFor="page">페이지</Label>
              <Input
                id="page"
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="페이지 번호"
                min="0"
              />
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="인용구에 대한 메모를 입력하세요..."
                className="min-h-[100px]"
              />
            </div>

            {/* Is Important */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isImportant"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked === true)}
              />
              <Label htmlFor="isImportant" className="cursor-pointer">
                중요 인용구로 표시
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
                {isSaving ? (
                  <>
                    <span className="mr-2">저장 중...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

