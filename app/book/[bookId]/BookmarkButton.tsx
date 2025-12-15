"use client"

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookmarkButtonProps {
  bookId: string;
  isBookmarked: boolean;
}

export function BookmarkButton({ bookId, isBookmarked: initialIsBookmarked }: BookmarkButtonProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const toggleBookmark = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/user/books/${bookId}/bookmark`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('북마크 토글에 실패했습니다.');
      }

      const data = await response.json();
      setIsBookmarked(data.data?.isBookmarked ?? !isBookmarked);
      router.refresh();
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      // 에러 발생 시 상태 롤백하지 않음 (사용자에게 피드백 제공 가능)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={toggleBookmark}
      disabled={isLoading}
    >
      <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      북마크
    </Button>
  );
}

