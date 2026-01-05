'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuoteAddClient({ bookId }: { bookId: string }) {
    const router = useRouter();
    const [newQuote, setNewQuote] = useState({ content: '', page: '', memo: '' });
    const [isImportant, setIsImportant] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const addQuote = async () => {
        if (!newQuote.content.trim()) {
            alert('인용구 내용을 입력해주세요.');
            return;
        }
    
        setIsSaving(true);
        try {
          const payload: {
            bookId: number;
            text: string;
            page?: number;
          } = {
            bookId: Number.parseInt(bookId, 10),
            text: newQuote.content.trim(),
          };
          
          // page가 있으면 추가 (백엔드는 Int? 타입이므로 null이 아닌 경우만 전송)
          if (newQuote.page && newQuote.page.trim()) {
            const pageNum = Number.parseInt(newQuote.page, 10);
            if (!isNaN(pageNum) && pageNum > 0) {
              payload.page = pageNum;
            }
          }
          
          console.log('Creating quote with payload:', payload);
          const response = await fetch(`/api/v1/quotes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            let errorData: Record<string, unknown> = {};
            try {
              errorData = JSON.parse(errorText) as Record<string, unknown>;
            } catch {
              errorData = { details: errorText || `HTTP ${response.status} ${response.statusText}` };
            }
            console.error('Quote creation failed:', {
              status: response.status,
              statusText: response.statusText,
              errorData,
              errorText
            });
            const errorMessage = (typeof errorData.message === 'string' ? errorData.message : null) 
              || (typeof errorData.details === 'string' ? errorData.details : null)
              || (typeof errorData.error === 'string' ? errorData.error : null)
              || `인용구 추가에 실패했습니다. (${response.status})`;
            throw new Error(errorMessage);
          }

          const result = await response.json();
          console.log('Quote creation result:', result);
          if (result.success !== false) {
            router.push(`/book/${bookId}?tab=highlights`);
          } else {
            throw new Error(result.message || '인용구 추가에 실패했습니다.');
          }
        } catch (error: unknown) {
          console.error('Error adding quote:', error);
          alert(`인용구 추가에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
          setIsSaving(false);
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
              <Button variant="outline" disabled={isSaving}>취소</Button>
            </Link>
            <Button onClick={addQuote} disabled={isSaving || !newQuote.content.trim()}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>

        {/* <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-muted">
              <Image src={book.cover || "/placeholder.svg"} alt={book.title} fill sizes="56px" className="object-cover" />
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
              <Checkbox 
                id="important" 
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked === true)}
              />
              <label
                htmlFor="important"
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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