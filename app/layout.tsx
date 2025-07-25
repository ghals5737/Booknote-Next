import { NextAuthProvider } from "@/components/context/NextAuthProvider";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SWRProvider } from "@/components/providers/SWRProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookNote - 개인 독서 관리 플랫폼",
  description: "독서를 체계적으로 관리하고, 독서 경험을 기록하며, 지식을 체계화할 수 있는 개인 독서 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <SWRProvider>
            {/* <BookProvider> */}
              <PageWrapper>
                {children}
              </PageWrapper>
            {/* </BookProvider> */}
          </SWRProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
