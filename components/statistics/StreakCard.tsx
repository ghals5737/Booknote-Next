"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Infinity } from "lucide-react";

interface StreakCardProps {
  streakDays: number;
}

export function StreakCard({ streakDays }: StreakCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#5E4B3C] to-[#4A3A2E] border-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Infinity className="h-5 w-5 text-white/80" />
            <p className="text-white/80 text-sm font-medium">연속 독서</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-white">
          {streakDays} 일째 🔥
        </p>
      </CardContent>
    </Card>
  )
}

