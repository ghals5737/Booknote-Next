"use client"

import { useSidebar } from '@/components/context/SidebarContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ClientOnly } from '@/components/ui/client-only'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { useNextAuth } from '@/hooks/use-nextauth'
import { Menu, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Navigation from '../sidebar/Navigation'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useNextAuth()
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar()
  const isMobile = useIsMobile()
  
  // 경로에 따른 현재 페이지 ID 매핑
  const getCurrentPage = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/library') || path.startsWith('/book')) return 'books'
    if (path.startsWith('/notes')) return 'notes'
    if (path.startsWith('/review')) return 'review'
    if (path.startsWith('/search')) return 'search'
    if (path.startsWith('/tags')) return 'tags'
    if (path.startsWith('/stats')) return 'statistics'
    if (path.startsWith('/archive')) return 'archive'
    return 'dashboard' // 기본값
  }

  const currentPage = getCurrentPage(pathname)

  const isAuthLikePage = pathname.startsWith('/auth') || pathname.startsWith('/signup')

  if (isAuthLikePage) {
    return (
      <div className="min-h-screen bg-background">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* 모바일 오버레이 */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* 사이드바 */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative'}
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <Navigation currentPage={currentPage} />
      </div>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* 상단 헤더 */}
        <div className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* 데스크톱에서는 빈 공간 */}
          <div className="hidden lg:block" />
          
          {/* 사용자 메뉴 */}
          <ClientOnly fallback={
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-muted animate-pulse rounded"></div>
              <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
            </div>
          }>
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push('/auth')}>로그인</Button>
                <Button onClick={() => router.push('/signup')}>회원가입</Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted/60">
                    <Avatar className="size-8">
                      <AvatarFallback>{(user?.id || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden sm:inline">사용자</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">사용자</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/books')}>내 서재</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>설정</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={logout}>로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ClientOnly>
        </div>
        
        {/* 페이지 콘텐츠 */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 