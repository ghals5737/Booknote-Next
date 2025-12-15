"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"

const MOCK_DATA = {
  goal: 50,
  current: 12,
  period: "올해",
}

export function ReadingGoalCard() {
  const percentage = Math.round((MOCK_DATA.current / MOCK_DATA.goal) * 100)
  const remaining = MOCK_DATA.goal - MOCK_DATA.current

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>독서 목표</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{MOCK_DATA.period} 목표</span>
            <span className="font-semibold">
              {MOCK_DATA.current}권 / {MOCK_DATA.goal}권
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">달성률</span>
            <span className="font-bold text-primary">{percentage}%</span>
          </div>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            목표까지 <span className="font-semibold text-foreground">{remaining}권</span> 남았습니다
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

