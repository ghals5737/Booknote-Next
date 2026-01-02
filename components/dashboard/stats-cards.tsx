'use client';

import { StreakCard } from "@/components/statistics/StreakCard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";
import { BookOpen, Eye } from "lucide-react";

interface StatsCardsProps {
  statisticsData: StatisticsResponse | null;
}

export function StatsCards({ statisticsData }: StatsCardsProps) {
  // 이번달 읽은 책 수 계산
  const getThisMonthReadCount = () => {
    if (!statisticsData?.monthly) return 0;
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const thisMonthData = statisticsData.monthly.find(
      (item) => item.year === currentYear && item.month === currentMonth
    );
    return thisMonthData?.readCount || 0;
  };

  // 올해 읽은 책 수 계산
  const getThisYearReadCount = () => {
    if (!statisticsData?.monthly) return 0;
    const currentYear = new Date().getFullYear().toString();
    return statisticsData.monthly
      .filter((item) => item.year === currentYear)
      .reduce((sum, item) => sum + item.readCount, 0);
  };

  const thisMonthReadCount = getThisMonthReadCount();
  const thisYearReadCount = getThisYearReadCount();
  const streakDays = statisticsData?.activity?.currentStreak || 0;
  
  // 이번달 목표 (기본값 5권, 추후 사용자 설정으로 변경 가능)
  const monthlyGoal = 5;
  const progressPercentage = Math.min((thisMonthReadCount / monthlyGoal) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 이번달 목표 카드 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">이번 달 목표</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {thisMonthReadCount} / {monthlyGoal}권
            </p>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 연속독서 카드 */}
      <StreakCard streakDays={streakDays} />

      {/* 올해 읽은 책 카드 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">올해 읽은 책</p>
            </div>
          </div>
          <p className="text-2xl font-bold">{thisYearReadCount} 권</p>
        </CardContent>
      </Card>
    </div>
  );
}

