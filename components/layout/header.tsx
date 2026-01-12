"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useNextAuth } from "@/hooks/use-nextauth"
import { BarChart3, BookOpen, Home, LogOut, Menu, RotateCcw, Search, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SearchModal } from "./SearchModal"

export function Header() {
  const { isAuthenticated, logout } = useNextAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    {
      href: "/home",
      label: "홈",
      icon: Home,
      isActive: pathname === "/home",
    },
    {
      href: "/library",
      label: "내 서재",
      icon: BookOpen,
      isActive: pathname === "/library",
    },
    {
      label: "검색",
      icon: Search,
      onClick: () => setIsSearchOpen(true),
    },
    {
      href: "/review",
      label: "리마인드",
      icon: RotateCcw,
      isActive: pathname === "/review",
    },
    {
      href: "/statistics",
      label: "통계",
      icon: BarChart3,
      isActive: pathname === "/statistics",
    },
  ]

  // Command+K (Mac) 또는 Ctrl+K (Windows/Linux) 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command+K (Mac) 또는 Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
      // ESC 키로 모달 닫기
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

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
          <span className="text-xl font-semibold" style={{ fontFamily: "'Lora', serif" }}>Booknote</span>
        </div>
        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="/home" 
            className={`text-sm font-medium transition-colors ${
              pathname === "/home" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            홈
          </a>
          <a 
            href="/library" 
            className={`text-sm font-medium transition-colors ${
              pathname === "/library" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            내 서재
          </a>
          <button onClick={() => setIsSearchOpen(true)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            검색
          </button>
          <a 
            href="/review" 
            className={`text-sm font-medium transition-colors ${
              pathname === "/review" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            리마인드
          </a>
          <a 
            href="/statistics" 
            className={`text-sm font-medium transition-colors ${
              pathname === "/statistics" 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
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

        {/* 모바일 메뉴 */}
        <div className="flex md:hidden items-center gap-4">
          <a
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <User className="h-4 w-4" />
          </a>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
              <div className="flex flex-col h-full">
                {/* 헤더 */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold" style={{ fontFamily: "'Lora', serif" }}>Booknote</span>
                    <span className="text-xs text-muted-foreground">메뉴</span>
                  </div>
                </div>

                {/* 메뉴 항목 */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.isActive || false

                    if (item.onClick) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.onClick?.()
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 group"
                        >
                          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                          <span>{item.label}</span>
                        </button>
                      )
                    }

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 group ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                            isActive ? "text-primary" : ""
                          }`}
                        />
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                        )}
                      </a>
                    )
                  })}
                </nav>

                {/* 구분선 및 로그아웃 */}
                {isAuthenticated && (
                  <>
                    <Separator className="mx-4" />
                    <div className="px-4 py-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group justify-start"
                      >
                        <LogOut className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-[-15deg]" />
                        <span>로그아웃</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* 검색 모달 */}
      {isSearchOpen && (
        <SearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </header>
  )
}