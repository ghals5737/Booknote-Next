"use client";
import { NextAuthProvider } from "@/components/context/NextAuthProvider";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { cleanupDuplicateTokens } from "@/lib/api/token";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 클라이언트 컴포넌트로 토큰 정리 실행
function TokenCleanupWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    cleanupDuplicateTokens();
  }, []);

  return <>{children}</>;
}

// 메타데이터 설정 컴포넌트
function MetadataSetter() {
  useEffect(() => {
    document.title = "BookNote - 개인 독서 관리 플랫폼";
    
    // 기존 메타 태그가 있다면 제거
    const existingDescription = document.querySelector('meta[name="description"]');
    if (existingDescription) {
      existingDescription.remove();
    }
    
    // 새로운 메타 태그 추가
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = '독서를 체계적으로 관리하고, 독서 경험을 기록하며, 지식을 체계화할 수 있는 개인 독서 관리 시스템';
    document.head.appendChild(metaDescription);
  }, []);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <MetadataSetter />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TokenCleanupWrapper>
          <NextAuthProvider>
            <SWRProvider>
                <PageWrapper>
                  {children}
                </PageWrapper>
            </SWRProvider>
          </NextAuthProvider>
        </TokenCleanupWrapper>
      </body>
    </html>
  );
}
