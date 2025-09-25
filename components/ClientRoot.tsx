"use client"

import { AuthProvider } from "@/components/context/AuthContext"
import { SidebarProvider } from "@/components/context/SidebarContext"
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary"
import { SWRProvider } from "@/components/providers/SWRProvider"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { cleanupDuplicateTokens } from "@/lib/api/token"
import { useEffect } from "react"
import { PageWrapper } from "./layout/PageWrapper"

function TokenCleanupWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    cleanupDuplicateTokens();
  }, []);
  return <>{children}</>;
}

function MetadataSetter() {
  useEffect(() => {
    document.title = "BookNote - 개인 독서 관리 플랫폼";
    const existingDescription = document.querySelector('meta[name="description"]');
    if (existingDescription) {
      existingDescription.remove();
    }
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = '독서를 체계적으로 관리하고, 독서 경험을 기록하며, 지식을 체계화할 수 있는 개인 독서 관리 시스템';
    document.head.appendChild(metaDescription);
  }, []);
  return null;
}

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <TokenCleanupWrapper>
          <SWRProvider>
            <AuthProvider>
              <SidebarProvider>
                <MetadataSetter />
                <PageWrapper>
                  {children}
                </PageWrapper>
              </SidebarProvider>
            </AuthProvider>
          </SWRProvider>
        </TokenCleanupWrapper>
      </ToastProvider>
    </ErrorBoundary>
  )
}


