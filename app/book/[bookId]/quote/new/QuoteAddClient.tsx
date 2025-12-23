'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState } from "react";

export default function QuoteAddClient({ bookId }: { bookId: string }) {
    const [newQuote, setNewQuote] = useState({ content: '', page: '', memo: '' });

    const addQuote = async () => {
        if (!newQuote.content.trim()) return;
    
        try {
          const payload = {
            bookId: bookId,
            text: newQuote.content,
            page: newQuote.page ? Number.parseInt(newQuote.page, 10) : 0,
          };
          await fetch(`/api/v1/quotes`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          alert('인용구가 추가되었습니다.');
        } catch (error) {
          console.error('Error adding quote:', error);
        }
    };
    return (
        <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">새 인용구 추가</h1>
            <p className="text-sm text-muted-foreground">인상 깊은 구절을 기록해보세요</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/book/${bookId}`}>
              <Button variant="outline">취소</Button>
            </Link>
            <Button onClick={addQuote}>저장</Button>
          </div>
        </div>

        {/* <Card className="mb-6 p-4">
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
        </Card> */}

        <div className="space-y-6">
          <div>
            <Label htmlFor="quote-content" className="mb-2 block text-sm font-medium">
              인용구 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="quote-content"
              className="min-h-[200px] resize-none"
              value={newQuote.content}
              onChange={(e) => setNewQuote({ ...newQuote, content: e.target.value })}
              placeholder="인상 깊었던 문장을 입력하세요"
              maxLength={1000}
            />
            <div className="mt-2 text-right text-xs text-muted-foreground">
              {newQuote.content.length}/1000자
            </div>
          </div>

          <div>
            <Label htmlFor="quote-memo" className="mb-2 block text-sm font-medium">
              메모 
            </Label>
            <Textarea
              id="quote-memo"
              className="min-h-[200px] resize-none"
              value={newQuote.memo}
              onChange={(e) => setNewQuote({ ...newQuote, memo: e.target.value })}
              placeholder="인상 깊었던 문장에 대한 생각을 적어보세요"
              maxLength={1000}
            />
            <div className="mt-2 text-right text-xs text-muted-foreground">
              {newQuote.memo.length}/1000자
            </div>
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
            <Input
                id="quote-page"
                type="number"
                value={newQuote.page}
                onChange={(e) => setNewQuote({ ...newQuote, page: e.target.value })}
                placeholder="페이지 번호"
            />
          </div>
        </div>
      </main>
    </div>
    );
}