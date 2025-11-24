"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookActionButtonsProps {
  bookId: string;
}

export function BookActionButtons({ bookId }: BookActionButtonsProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/user/books/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "삭제에 실패했습니다.");
        throw new Error(errorText);
      }

      setIsConfirmOpen(false);
      router.push("/new/dashboard");
      router.refresh();
    } catch (error) {
      console.error("책 삭제 실패:", error);
      alert("책 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/new/book/${bookId}/update`}>
          <Button variant="outline" size="icon" title="책 정보 수정">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="icon"
          title="책 삭제"
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>책을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              삭제한 책은 되돌릴 수 없습니다. 계속 진행하시려면 아래 버튼을 눌러주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

