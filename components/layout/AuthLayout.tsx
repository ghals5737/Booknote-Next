"use client"

import { AuthPage } from "@/components/auth/AuthPage"
import Navigation from "@/components/sidebar/Navigation"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useNextAuth } from "@/hooks/use-next-auth"
import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useNextAuth()
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // 5초 후에도 로딩이 계속되면 에러로 간주
    const timeout = setTimeout(() => {
      if (isLoading && retryCount < 3) {
        setRetryCount(prev => prev + 1)
        // 클라이언트 사이드에서만 페이지 새로고침
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else if (isLoading && retryCount >= 3) {
        setHasError(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isLoading, retryCount])

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">인증 서비스 오류</h2>
          <p className="text-muted-foreground mb-4">
            인증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
          </p>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">
            {retryCount > 0 ? `재시도 중... (${retryCount}/3)` : "로딩 중..."}
          </p>
        </div>
      </div> 
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Navigation 
          currentPage="dashboard"
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-secondary glass-effect px-4">
            <SidebarTrigger className="text-foreground hover:bg-secondary rounded-lg transition-all duration-200" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto bg-content">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 