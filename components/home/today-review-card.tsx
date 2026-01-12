'use client';

import { ArrowRight, Bookmark } from 'lucide-react';
import Link from 'next/link';

interface TodayReviewCardProps {
  reviewCount: number;
}

export function TodayReviewCard({ reviewCount }: TodayReviewCardProps) {
  return (
    <Link
      href="/review"
      className="group relative flex items-center gap-4 rounded-xl bg-[#E6DCCA] p-6 transition-all hover:shadow-md mb-12"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Bookmark className="h-6 w-6 text-[#4E4036]" />
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[#2C2622]">오늘의 복습</h3>
          {reviewCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4E4036] text-xs font-medium text-white">
              {reviewCount}
            </span>
          )}
        </div>
        {reviewCount > 0 ? (
          <>
            <p className="text-sm text-[#4A4A4A]">
              오늘 복습할 기억이 {reviewCount}개 있어요
            </p>
            <p className="mt-1 text-xs text-[#8C8C8C]">
              과거의 기록을 다시 돌아보며 기억을 강화해보세요
            </p>
          </>
        ) : (
          <p className="text-sm text-[#4A4A4A]">
            오늘 복습할 항목이 없습니다
          </p>
        )}
      </div>
      <ArrowRight className="h-5 w-5 text-[#4E4036] transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
