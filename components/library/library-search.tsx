'use client';

import { Search } from 'lucide-react';

interface LibrarySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function LibrarySearch({ value, onChange }: LibrarySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="책 제목, 저자로 검색..."
        className="w-full rounded-lg border border-[#EAEAEA] bg-white px-4 py-3 pl-10 text-sm text-[#2C2622] placeholder:text-[#8C8C8C] focus:border-[#4E4036] focus:outline-none focus:ring-2 focus:ring-[#4E4036]/20"
      />
    </div>
  );
}
