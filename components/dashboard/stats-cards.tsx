'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { CreateGoalApiResponse, CreateGoalRequest, GoalsResponse } from "@/lib/types/goal/goal";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";
import { BookOpen, Flame, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StatsCardsProps {
  statisticsData: StatisticsResponse | null;
  goalsData: GoalsResponse | null;
}

export function StatsCards({ statisticsData, goalsData }: StatsCardsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [target, setTarget] = useState<string>('2');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  // 이번달 목표
  const monthlyGoal = goalsData?.monthly?.target || 0;
  const hasGoal = monthlyGoal > 0;
  const progressPercentage = monthlyGoal > 0 ? Math.min((thisMonthReadCount / monthlyGoal) * 100, 100) : 0;

  // 현재 날짜 문자열 생성 (예: "2025년 1월")
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  };

  // 목표 생성 핸들러
  const handleCreateGoal = async () => {
    const targetNumber = parseInt(target, 10);
    
    if (isNaN(targetNumber) || targetNumber < 1) {
      toast({
        title: '입력 오류',
        description: '목표 책 수는 1권 이상이어야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const requestBody: CreateGoalRequest = {
        type: 'monthly',
        target: targetNumber,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };

      const result = await authenticatedApiRequest<CreateGoalApiResponse['data']>('/api/v1/goals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (result.success) {
        toast({
          title: '목표 설정 완료',
          description: `이번 달 목표를 ${targetNumber}권으로 설정했습니다.`,
        });
        setIsDialogOpen(false);
        router.refresh(); // 페이지 새로고침하여 목표 데이터 갱신
      }
    } catch (error) {
      console.error('목표 생성 오류:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '목표 설정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 이번달 목표 카드 */}
        {hasGoal ? (
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">이번 달 목표</h3>
                  <p className="text-xs text-muted-foreground">{getCurrentMonthString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="mb-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{thisMonthReadCount}</span>
                <span className="text-lg text-muted-foreground">/ {monthlyGoal}권</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-secondary/30">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>
                {monthlyGoal - thisMonthReadCount > 0
                  ? `${monthlyGoal - thisMonthReadCount}권 더 읽으면 달성`
                  : '목표 달성 완료! 🎉'}
              </span>
            </div>
          </div>
        ) : (
          <div 
            className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm cursor-pointer hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/15 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">이번 달 목표</h3>
                  <p className="text-xs text-muted-foreground">{getCurrentMonthString()}</p>
                </div>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">목표 설정하기</p>
            </div>
          </div>
        )}

        {/* 연속 독서 카드 */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/40">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">연속 독서</h3>
              <p className="text-xs text-muted-foreground">매일 조금씩</p>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold">{streakDays}</span>
            <span className="ml-1 text-lg text-muted-foreground">일째</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {streakDays > 0
              ? `${streakDays}일 연속 독서 중! 🔥`
              : '오늘부터 시작해보세요'}
          </p>
        </div>

        {/* 올해 읽은 책 카드 */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">올해 읽은 책</h3>
              <p className="text-xs text-muted-foreground">{new Date().getFullYear()}년</p>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold">{thisYearReadCount}</span>
            <span className="ml-1 text-lg text-muted-foreground">권</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {thisYearReadCount > 0
              ? `작년보다 ${Math.max(0, thisYearReadCount - 15)}권 더 읽었어요`
              : '첫 책을 시작해보세요'}
          </p>
        </div>
      </div>

      {/* 목표 설정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이번 달 목표 설정</DialogTitle>
            <DialogDescription>
              이번 달에 읽고 싶은 책의 목표 권수를 설정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target">목표 책 수</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={isSubmitting}
            >
              {isSubmitting ? '설정 중...' : '설정하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
