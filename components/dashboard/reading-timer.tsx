'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authenticatedApiRequest } from "@/lib/api/nextauth-api";
import { CurrentTimerResponse, StopTimerRequest } from "@/lib/types/timer/timer";
import { Clock, Pause } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ReadingTimerProps {
  timer: CurrentTimerResponse;
  onStop: () => void;
}

export function ReadingTimer({ timer, onStop }: ReadingTimerProps) {
  const { toast } = useToast();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStopping, setIsStopping] = useState(false);

  // 경과 시간 계산
  useEffect(() => {
    const startTime = new Date(timer.startTime).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);
    };

    // 즉시 업데이트
    updateElapsed();

    // 1초마다 업데이트
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [timer.startTime]);

  // 시간 포맷팅 (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 타이머 중지
  const handleStop = async () => {
    if (isStopping) return;

    try {
      setIsStopping(true);

      const requestBody: StopTimerRequest = {
        timerId: timer.timerId,
      };

      await authenticatedApiRequest('/api/v1/timer/stop', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      toast({
        title: '타이머 종료',
        description: `${formatTime(elapsedSeconds)} 동안 독서했습니다.`,
      });

      onStop();
    } catch (error) {
      console.error('타이머 중지 오류:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '타이머 중지에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* 책 표지 */}
          {timer.bookCover && (
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md shadow-sm">
              <Image
                src={timer.bookCover}
                alt={timer.bookTitle}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}

          {/* 타이머 정보 */}
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">독서 타이머</span>
            </div>
            <h3 className="mb-1 truncate font-semibold text-lg">{timer.bookTitle}</h3>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatTime(elapsedSeconds)}
              </span>
              {timer.targetMinutes && (
                <span className="text-sm text-muted-foreground">
                  / {timer.targetMinutes}분
                </span>
              )}
            </div>
          </div>

          {/* 중지 버튼 */}
          <Button
            onClick={handleStop}
            disabled={isStopping}
            variant="destructive"
            size="lg"
            className="flex-shrink-0"
          >
            {isStopping ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                종료 중...
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                종료
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

