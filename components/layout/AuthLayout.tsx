"use client"

import { useNextAuth } from "@/hooks/use-next-auth"
import { AuthPage } from "@/components/auth/AuthPage"
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/sidebar/AppSideBar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useNextAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-cool">로딩 중...</p>
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
        <AppSidebar />
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