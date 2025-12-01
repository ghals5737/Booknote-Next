"use client";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { SearchModal } from "./SearchModal";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold">Booknote</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            내 서재
          </a>
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsSearchOpen(true)}
          >
            검색
          </button>
          <a href="/review" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            리마인드
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            통계
          </a>
        </nav>
      </div>
      {/* 검색 모달 */}
      {isSearchOpen && (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </header>
  )
}