'use client';

import { Folder, Plus } from 'lucide-react';
import Link from 'next/link';

interface LibraryHeaderProps {
  totalCount: number;
}

export function LibraryHeader({ totalCount }: LibraryHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-end gap-3">
        <h1 className="text-3xl font-bold text-[#2C2622]">내 서재</h1>
        <span className="mb-1 text-sm text-[#8C8C8C]">총 {totalCount}권</span>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-[#E6DCCA] px-4 py-2.5 text-sm font-medium text-[#4E4036] transition-colors hover:bg-[#D4C5B0]">
          <Folder className="h-4 w-4" />
          <span>폴더</span>
        </button>
        <Link
          href="/book/add"
          className="flex items-center gap-2 rounded-lg bg-[#C9A961] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B89A50]"
        >
          <Plus className="h-4 w-4" />
          <span>책 추가</span>
        </Link>
      </div>
    </div>
  );
}
