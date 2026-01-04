"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Infinity } from "lucide-react";

interface StreakCardProps {
  streakDays: number;
}

export function StreakCard({ streakDays }: StreakCardProps) {
  // 연속일 시각화 (최대 7개)
  const maxDays = 7;
  const displayDays = Math.min(streakDays, maxDays);
  const hasMore = streakDays > maxDays;

  return (
    <Card className="bg-gradient-to-br from-[#5E4B3C] to-[#4A3A2E] border-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Infinity className="h-5 w-5 text-white/80" />
            <p className="text-white/80 text-sm font-medium">연속 독서</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-white mb-3">
          {streakDays} 일째 🔥
        </p>
        {/* 연속일 막대 그래프 */}
        <div className="flex items-end gap-1">
          {Array.from({ length: displayDays }).map((_, index) => {
            // 높이를 다양하게 (1일째부터 점점 높아짐)
            const height = Math.min(100, 40 + (index * 8));
            return (
              <div
                key={index}
                className="bg-white/30 rounded-t transition-all duration-300"
                style={{ 
                  width: '12px',
                  height: `${height}%`,
                  minHeight: '8px'
                }}
              />
            );
          })}
          {hasMore && (
            <span className="text-white/60 text-xs ml-1">+{streakDays - maxDays}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

