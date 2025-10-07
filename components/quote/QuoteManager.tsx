'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBooks } from "@/hooks/use-books";
import { useAddQuote } from "@/hooks/use-notes";
import { QuoteResponse } from "@/lib/types/quote/quote";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Heart,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface QuoteManagerProps {
  selectedBookId?: string;
  onQuoteAdded?: () => void;
  quotes: QuoteResponse[];
  quotesLoading: boolean;
  quotesError: any;
  mutateQuotes: () => void;
}

export const QuoteManager = ({ 
  selectedBookId, 
  onQuoteAdded, 
  quotes, 
  quotesLoading, 
  quotesError, 
  mutateQuotes 
}: QuoteManagerProps) => {
  console.log("quotes", quotes);
  const { books, isLoading: booksLoading, error: booksError } = useBooks(0, 100);
  const { addQuote } = useAddQuote();
  
  const [selectedBook, setSelectedBook] = useState(selectedBookId || "");
  const [newQuote, setNewQuote] = useState("");
  const [quotePage, setQuotePage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);

  const handleAddQuote = async () => {
    if (!newQuote.trim()) {
      alert('인용구를 입력해주세요.');
      return;
    }

    if (!selectedBook) {
      alert('책을 선택해주세요.');
      return;
    }

    setIsAdding(true);
    try {
      await addQuote({
        bookId: parseInt(selectedBook),
        text: newQuote.trim(),
        page: parseInt(quotePage) || 0,
      });
      
      setNewQuote("");
      setQuotePage("");
      setIsAddFormExpanded(false); // 추가 완료 후 폼 접기
      mutateQuotes();
      onQuoteAdded?.();
    } catch (error) {
      console.error('인용구 추가 실패:', error);
      alert('인용구 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteQuote = async (quoteId: number) => {
    if (confirm('이 인용구를 삭제하시겠습니까?')) {
      try {
        // TODO: deleteQuote 훅이 필요하면 추가
        console.log('Delete quote:', quoteId);
        mutateQuotes();
      } catch (error) {
        console.error('인용구 삭제 실패:', error);
        alert('인용구 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 새 인용구 추가 */}
      <Card className="knowledge-card">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>새 인용구 추가</span>
            </div>
            {isAddFormExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        
        {isAddFormExpanded && (
          <CardContent>
            <div className="space-y-4">
              {/* 책 선택 */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">책 선택</label>
                {booksLoading ? (
                  <div className="text-sm text-muted-foreground">책 목록을 불러오는 중...</div>
                ) : booksError ? (
                  <div className="text-sm text-red-500">책 목록을 불러오는데 실패했습니다.</div>
                ) : books.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    아직 서재에 책이 없습니다.<br />
                    먼저 책을 추가해주세요.
                  </div>
                ) : (
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue placeholder="책을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => {
                        const truncatedTitle = book.title.length > 30 
                          ? `${book.title.substring(0, 30)}...` 
                          : book.title;
                        return (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {truncatedTitle}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* 인용구 입력 */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">인용구</label>
                <Textarea
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="마음에 드는 문장을 입력하세요..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* 페이지 번호 */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">페이지 번호 (선택사항)</label>
                <Input
                  type="number"
                  value={quotePage}
                  onChange={(e) => setQuotePage(e.target.value)}
                  placeholder="페이지 번호"
                  className="w-32"
                />
              </div>

              {/* 추가 버튼 */}
              <Button 
                onClick={handleAddQuote} 
                disabled={isAdding || !newQuote.trim() || !selectedBook}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? '추가 중...' : '인용구 추가'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 인용구 목록 */}
      <Card className="knowledge-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>저장된 인용구</span>
            {quotes && (
              <Badge variant="secondary" className="ml-2">
                {quotes.length}개
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quotesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">인용구 목록을 불러오는 중...</div>
            </div>
          ) : quotesError ? (
            <div className="text-sm text-red-500">인용구 목록을 불러오는데 실패했습니다.</div>
          ) : !quotes || quotes.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">아직 저장한 인용구가 없습니다</h3>
              <p className="text-muted-foreground">마음에 드는 문장을 저장해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <Card key={quote.id} className="bg-gradient-warm">
                  <CardContent className="p-4">
                    <blockquote className="text-foreground mb-3 leading-relaxed text-base">
                      "{quote.content}"
                    </blockquote>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          책 ID: {quote.bookId}
                        </span>
                        {quote.page > 0 && (
                          <span className="flex items-center">
                            {quote.page}페이지
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {quote.isImportant ? '중요' : '일반'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
