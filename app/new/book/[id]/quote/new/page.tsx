import { Header } from "@/components/new/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import Link from "next/link"

const booksData = [
  {
    id: 1,
    title: "아토믹 해빗",
    author: "제임스 클리어",
    category: "자기계발",
    cover: "/atomic-habits-cover.png",
  },
]

export default async function AddQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = booksData.find((b) => b.id === Number.parseInt(id))

  if (!book) {
    return <div>책을 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">새 인용구 추가</h1>
            <p className="text-sm text-muted-foreground">{book.title}에서 인상 깊은 구절을 기록해보세요</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/book/${id}`}>
              <Button variant="outline">취소</Button>
            </Link>
            <Button>저장</Button>
          </div>
        </div>

        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-muted">
              <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">{book.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{book.author}</p>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {book.category}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <Label htmlFor="quote-content" className="mb-2 block text-sm font-medium">
              인용구 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="quote-content"
              placeholder="인상 깊은 구절을 입력하세요..."
              className="min-h-[200px] resize-none"
            />
            <div className="mt-2 text-right text-xs text-muted-foreground">0/1000자</div>
          </div>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="important" />
              <label
                htmlFor="important"
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="text-yellow-500">⭐</span>
                중요 인용구로 표시
              </label>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 font-medium">메모</h3>
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              인용구 내용이 여기에 표시됩니다...
            </div>
          </Card>

          <div>
            <Label htmlFor="page-number" className="mb-2 block text-sm font-medium">
              페이지 번호 <span className="text-destructive">*</span>
            </Label>
            <Input id="page-number" type="number" placeholder="페이지 번호를 입력하세요" />
          </div>
        </div>
      </main>
    </div>
  )
}
