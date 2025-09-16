"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNextAuth } from '@/hooks/use-next-auth'
import { usePathname, useRouter } from 'next/navigation'
import Navigation from '../sidebar/Navigation'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useNextAuth()
  
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
      <Navigation currentPage={currentPage} />
      <main className="flex-1 overflow-auto">
        <div className="w-full flex items-center justify-end gap-2 px-4 py-3 border-b border-border">
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
                    {user?.image ? (
                      <AvatarImage src={user.image as string} alt={user?.name || 'user'} />
                    ) : (
                      <AvatarFallback>{(user?.name || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.name || '사용자'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name || '사용자'}</span>
                    {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
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
        </div>
        {children}
      </main>
    </div>
  )
} 