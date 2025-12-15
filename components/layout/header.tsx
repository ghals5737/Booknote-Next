"use client"

import { Button } from "@/components/ui/button"
import { useNextAuth } from "@/hooks/use-nextauth"
import { BookOpen, LogOut, User } from "lucide-react"

export function Header() {
  const { isAuthenticated, logout } = useNextAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

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
          <a href="/statistics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            통계
          </a>
          <a
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <User className="h-4 w-4" />
          </a>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          )}
        </nav>
      </div>
      {/* 검색 모달 */}
      {isSearchOpen && (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </header>
  )
}