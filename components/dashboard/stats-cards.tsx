'use client';

import { StreakCard } from "@/components/statistics/StreakCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { CreateGoalApiResponse, CreateGoalRequest, GoalsResponse } from "@/lib/types/goal/goal";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";
import { BookOpen, Eye, Target } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 이번달 목표 카드 */}
        {hasGoal ? (
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
        ) : (
          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-full min-h-[100px]">
                <div className="text-center space-y-2">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm font-medium">목표 설정하기</p>
                  <p className="text-xs text-muted-foreground">이번 달 목표를 설정해보세요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            <p className="text-2xl font-bold mb-3">{thisYearReadCount} 권</p>
            {/* 책 아이콘 시각화 (최대 10개) */}
            {thisYearReadCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: Math.min(thisYearReadCount, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                ))}
                {thisYearReadCount > 10 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{thisYearReadCount - 10}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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

