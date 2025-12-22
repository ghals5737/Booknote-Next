"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOK_CATEGORY_IDS, BOOK_CATEGORY_LABELS, BookDetailData } from "@/lib/types/book/book";
import { cn } from "@/lib/utils";
import { ImageIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookUpdateClientProps {
  bookId: string;
  initialData: BookDetailData;
}

export function BookUpdateClient({ bookId, initialData }: BookUpdateClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title || "");
  const [author, setAuthor] = useState(initialData.author || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [publisher, setPublisher] = useState(initialData.publisher || "");
  const [coverImage] = useState(initialData.coverImage || "");
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 0);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 0);
  const [progress, setProgress] = useState(initialData.progress || 0);
  const [rating, setRating] = useState(initialData.rating || 0);
  const [pubdate, setPubdate] = useState(
    initialData.pubdate ? initialData.pubdate.slice(0, 10) : ""
  );
  const [isbn] = useState(initialData.isbn || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    description: "",
    isSuccess: true,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !author.trim() || !category.trim()) {
      setDialogState({
        open: true,
        title: "필수 입력 누락",
        description: "책 제목, 저자, 카테고리를 모두 입력해주세요.",
        isSuccess: false,
      });
      return;
    }

    setIsSubmitting(true);
    try {      

      const normalizedProgress =
        totalPages > 0 && currentPage >= 0
          ? Math.min(100, Math.round((currentPage / Math.max(totalPages, 1)) * 100))
          : progress;

      const payload = {
        id: initialData.id,
        title: title.trim(),
        description: description.trim(),
        author: author.trim(),
        category: category.trim(),
        progress: normalizedProgress,
        totalPages: Math.max(totalPages, 0),
        currentPage: Math.max(currentPage, 0),
        rating: Math.max(0, Math.min(5, rating)),
        imgUrl: coverImage,
        pubdate:
          pubdate ||
          initialData.pubdate ||
          new Date().toISOString().split("T")[0],
        publisher: publisher.trim(),
        isbn,
      };

      const response = await fetch(`/api/v1/user/books`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",          
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "책 정보 수정에 실패했습니다.");
        throw new Error(text);
      }

      setDialogState({
        open: true,
        title: "수정 완료",
        description: "책 정보가 성공적으로 수정되었습니다.",
        isSuccess: true,
      });
    } catch (error) {
      console.error("책 정보 수정 실패:", error);
      setDialogState({
        open: true,
        title: "수정 실패",
        description: "책 정보를 수정하지 못했습니다. 다시 시도해주세요.",
        isSuccess: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    const wasSuccess = dialogState.isSuccess;
    setDialogState((prev) => ({ ...prev, open: false }));
    if (wasSuccess) {
      router.push(`/book/${bookId}`);
      router.refresh();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left Section - Book Cover */}
          <div className="space-y-4">
            <div>
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="책 표지"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-center ${coverImage ? 'hidden' : ''}`}>
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">표지 이미지</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Book Information */}
          <div className="space-y-6 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">책 정보</h2>
            
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                책 제목 *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="책 제목을 입력하세요"
                className="mt-1.5"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="author" className="text-sm font-medium">
                  저자 *
                </Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="저자명을 입력하세요"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  카테고리 *
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORY_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {BOOK_CATEGORY_LABELS[id]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="publisher" className="text-sm font-medium">
                출판사
              </Label>
              <Input
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="출판사를 입력하세요"
                className="mt-1.5"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="isbn" className="text-sm font-medium">
                  ISBN
                </Label>
                <Input 
                  id="isbn" 
                  value={isbn} 
                  readOnly 
                  disabled 
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pubdate" className="text-sm font-medium">
                  출판일
                </Label>
                <Input
                  id="pubdate"
                  type="date"
                  value={pubdate}
                  onChange={(e) => setPubdate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                책 설명
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="책에 대한 간단한 설명을 입력하세요"
                className="mt-1.5 min-h-[120px] resize-none"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-4">
              <div>
                <Label htmlFor="totalPages" className="text-sm font-medium">
                  총 페이지
                </Label>
                <Input
                  id="totalPages"
                  type="number"
                  min={0}
                  value={totalPages}
                  onChange={(e) => setTotalPages(Number(e.target.value) || 0)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="currentPage" className="text-sm font-medium">
                  현재 페이지
                </Label>
                <Input
                  id="currentPage"
                  type="number"
                  min={0}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value) || 0)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="progress" className="text-sm font-medium">
                  진행률 (%)
                </Label>
                <Input
                  id="progress"
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">
                  평점
                </Label>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(rating === starValue ? 0 : starValue)}
                      className={cn(
                        "transition-all duration-150",
                        "hover:scale-110 active:scale-95",
                        "h-5 w-5"
                      )}
                      aria-label={`${starValue}점`}
                    >
                      <Star
                        className={cn(
                          "h-5 w-5 transition-colors",
                          starValue <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-200"
                        )}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {rating}점
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/book/${bookId}`)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "수정 중..." : "수정하기"}
          </Button>
        </div>
      </form>

      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className={dialogState.isSuccess ? "text-green-600" : "text-red-500"}>
              {dialogState.title}
            </DialogTitle>
            <DialogDescription>{dialogState.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDialogClose}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

