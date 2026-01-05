"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { BookDetailData } from "@/lib/types/book/book";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompleteBookButtonProps {
  bookId: string;
  bookDetail: BookDetailData;
}

export function CompleteBookButton({ bookId, bookDetail }: CompleteBookButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // 이미 완독한 경우 버튼 숨김
  if (bookDetail.progress >= 100) {
    return null;
  }

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    
    try {
      // API 요청에 필요한 모든 필드 포함
      const payload = {
        id: bookDetail.id,
        title: bookDetail.title,
        description: bookDetail.description || "",
        author: bookDetail.author,
        category: bookDetail.category,
        progress: 100,
        totalPages: bookDetail.totalPages,
        currentPage: bookDetail.totalPages, // 완독 시 현재 페이지를 전체 페이지로 설정
        imgUrl: bookDetail.coverImage || "",
        pubdate: bookDetail.pubdate || null,
        publisher: bookDetail.publisher || "",
        isbn: bookDetail.isbn || "",
        rating: bookDetail.rating || 0,
      };

      const result = await authenticatedApiRequest(`/api/v1/user/books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (result.success) {
        toast({
          title: "완독 완료",
          description: "책을 완독으로 표시했습니다. 통계에 반영됩니다.",
        });
        setIsConfirmOpen(false);
        router.refresh(); // 페이지 새로고침하여 업데이트된 정보 표시
      }
    } catch (error) {
      console.error("완독 처리 실패:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "완독 처리에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2 rounded-lg border-2 border-primary bg-card px-6 py-3 font-medium text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
      >
        <Check className="h-5 w-5" />
        <span>완독 처리</span>
      </button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>책을 완독으로 표시하시겠습니까?</DialogTitle>
            <DialogDescription>
              진행률을 100%로 설정하고 완독 날짜를 기록합니다. 통계에 자동으로 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isCompleting}
            >
              취소
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? "처리 중..." : "완독하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

