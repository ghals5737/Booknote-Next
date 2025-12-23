"use client";

import { StarRatingInput } from "@/components/book/star-rating-input";
import { useRouter } from "next/navigation";

interface StarRatingWrapperProps {
  bookId: number;
  initialRating: number;
}

export function StarRatingWrapper({ bookId, initialRating }: StarRatingWrapperProps) {
  const router = useRouter();

  const handleRatingChange = () => {
    // 별점 변경 후 페이지 새로고침
    router.refresh();
  };

  return (
    <StarRatingInput
      bookId={bookId}
      initialRating={initialRating}
      size="md"
      showLabel={false}
      onRatingChange={handleRatingChange}
    />
  );
}

