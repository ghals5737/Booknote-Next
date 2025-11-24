"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookDetailData } from "@/lib/types/book/book";
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
  const [coverImage, setCoverImage] = useState(initialData.coverImage || "");
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 0);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 0);
  const [progress, setProgress] = useState(initialData.progress || 0);
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
        imgUrl: coverImage,
        pubdate:
          pubdate ||
          initialData.pubdate ||
          new Date().toISOString().split("T")[0],
        publisher: publisher.trim(),
        isbn,
      };

      const response = await fetch(`/api/v1/books`, {
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
      router.push(`/new/book/${bookId}`);
      router.refresh();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">책 제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목을 입력하세요"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="author">저자 *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자명을 입력하세요"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">카테고리 *</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="카테고리를 입력하세요"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="publisher">출판사</Label>
          <Input
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="출판사를 입력하세요"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="isbn">ISBN</Label>
            <Input id="isbn" value={isbn} readOnly disabled />
          </div>
          <div>
            <Label htmlFor="pubdate">출판일</Label>
            <Input
              id="pubdate"
              type="date"
              value={pubdate}
              onChange={(e) => setPubdate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cover">표지 이미지 URL</Label>
          <Input
            id="cover"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="표지 이미지 URL을 입력하세요"
          />
        </div>

        <div>
          <Label htmlFor="description">책 설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="책에 대한 설명을 입력하세요"
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="totalPages">총 페이지</Label>
            <Input
              id="totalPages"
              type="number"
              min={0}
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="currentPage">현재 페이지</Label>
            <Input
              id="currentPage"
              type="number"
              min={0}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="progress">진행률 (%)</Label>
            <Input
              id="progress"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/new/book/${bookId}`)}
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

