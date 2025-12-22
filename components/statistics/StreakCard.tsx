"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface StreakCardProps {
  streakDays: number;
}

export function StreakCard({ streakDays }: StreakCardProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">연속 독서 기록</p>
            <p className="text-white text-4xl font-bold">{streakDays}일</p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20">
            <Flame className="h-8 w-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

