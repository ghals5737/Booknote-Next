"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyStat } from "@/lib/types/statistics/statistics"

interface ActivityTabProps {
  monthlyData: MonthlyStat[];
}

export function ActivityTab({ monthlyData }: ActivityTabProps) {
  // 가장 최근 월 데이터 가져오기
  const latestMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;
  
  // 전체 통계 계산
  const totalPages = monthlyData.reduce((sum, item) => sum + item.pageCount, 0);
  const averagePagesPerMonth = monthlyData.length > 0 
    ? Math.round(totalPages / monthlyData.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 월별 활동 상세 */}
      {latestMonth && (
        <Card>
          <CardHeader>
            <CardTitle>월별 활동 상세</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold mb-4">{latestMonth.label}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">읽은 책</p>
                  <p className="text-xl font-semibold">{latestMonth.readCount}권</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">읽은 페이지</p>
                  <p className="text-xl font-semibold">{latestMonth.pageCount}페이지</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 독서 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>독서 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {latestMonth && (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <div className="text-5xl font-bold text-primary mb-2">
                  {latestMonth.pageCount}페이지
                </div>
                <p className="text-muted-foreground">
                  {latestMonth.label} 읽은 페이지
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">평균/월</p>
                <p className="text-lg font-semibold">{averagePagesPerMonth}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">이번 달 책</p>
                <p className="text-lg font-semibold">{latestMonth?.readCount || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">총 페이지</p>
                <p className="text-lg font-semibold">{totalPages}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

