"use client"

import { DailyDiscoveryCard } from "@/components/dashboard/daily-discovery-card"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ReminderPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />대시보드로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-balance">오늘의 발견</h1>
          <p className="text-muted-foreground">매일 새로운 인사이트를 발견하세요</p>
        </div>

        <DailyDiscoveryCard />
      </main>
    </div>
  )
}

