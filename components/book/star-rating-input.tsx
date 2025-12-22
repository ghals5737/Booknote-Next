"use client";

import { useUpdateBookRating } from "@/hooks/use-books";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface StarRatingInputProps {
  bookId: number;
  initialRating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  refreshOnUpdate?: boolean;
}

const STAR_INDICES = [0, 1, 2, 3, 4];

export function StarRatingInput({
  bookId,
  initialRating,
  size = "md",
  showLabel = false,
  onRatingChange,
  className,
  refreshOnUpdate = false,
}: StarRatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateRating } = useUpdateBookRating();
  const { toast } = useToast();
  const router = useRouter();

  // initialRating이 변경되면 currentRating도 업데이트
  useEffect(() => {
    setCurrentRating(initialRating);
  }, [initialRating]);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = useCallback(
    async (rating: number) => {
      if (isUpdating) return;

      const newRating = rating === currentRating ? 0 : rating; // 같은 별을 클릭하면 0으로 (별점 제거)
      
      setIsUpdating(true);
      try {
        await updateRating(bookId, newRating);
        setCurrentRating(newRating);
        onRatingChange?.(newRating);
        toast({
          title: "별점이 업데이트되었습니다",
          description: newRating > 0 ? `${newRating}점으로 평가했습니다.` : "별점이 제거되었습니다.",
        });
        // 필요시 페이지 새로고침 (서버 컴포넌트 데이터 갱신)
        if (refreshOnUpdate) {
          router.refresh();
        }
      } catch (error) {
        console.error("별점 업데이트 실패:", error);
        toast({
          title: "별점 업데이트 실패",
          description: "별점을 업데이트하지 못했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [bookId, currentRating, updateRating, toast, onRatingChange, isUpdating, refreshOnUpdate, router]
  );

  const displayRating = hoveredRating !== null ? hoveredRating : currentRating;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className="flex items-center gap-0.5 cursor-pointer group"
        onMouseLeave={() => setHoveredRating(null)}
      >
        {STAR_INDICES.map((index) => {
          const isFilled = index < displayRating;
          const isHalf = displayRating % 1 !== 0 && index === Math.floor(displayRating);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(index + 1)}
              onMouseEnter={() => setHoveredRating(index + 1)}
              disabled={isUpdating}
              className={cn(
                "transition-all duration-150",
                "hover:scale-110 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sizeClasses[size]
              )}
              aria-label={`${index + 1}점`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 group-hover:text-yellow-200",
                  "transition-colors"
                )}
                style={
                  isHalf
                    ? {
                        clipPath: "inset(0 50% 0 0)",
                        fill: "rgb(250 204 21)", // yellow-400
                        color: "rgb(250 204 21)",
                      }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <div className="text-xs text-muted-foreground">
          {currentRating > 0 ? `${currentRating}점` : "별점 없음"}
        </div>
      )}
    </div>
  );
}

