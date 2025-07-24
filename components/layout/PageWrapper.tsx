"use client"

import { usePathname } from 'next/navigation'
import Navigation from '../sidebar/Navigation'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  
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

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation currentPage={currentPage} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
} 