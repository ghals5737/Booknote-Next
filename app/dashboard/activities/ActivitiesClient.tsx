'use client';

import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ActivityResponse } from '@/lib/types/dashboard/dashboard';
import { PageResponse } from '@/lib/types/pagenation/pagenation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ActivitiesClientProps {
  activitiesData: PageResponse<ActivityResponse>;
  currentType?: string;
}

export function ActivitiesClient({ activitiesData, currentType }: ActivitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = activitiesData.number;
  const totalPages = activitiesData.totalPages;
  const hasNext = !activitiesData.last;
  const hasPrev = !activitiesData.first;

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    params.set('page', '0'); // 타입 변경 시 첫 페이지로
    router.push(`/dashboard/activities?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/activities?${params.toString()}`);
  };

  const activityTypes = [
    { value: 'all', label: '전체' },
    { value: 'note', label: '노트' },
    { value: 'quote', label: '인용구' },
    { value: 'reading', label: '독서' },
    { value: 'finished', label: '완독' },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          대시보드로 돌아가기
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">전체 활동</h1>
            <p className="mt-2 text-muted-foreground">
              총 {activitiesData.totalElements}개의 활동 기록
            </p>
          </div>
          
          {/* 타입 필터 */}
          <Select
            value={currentType || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="활동 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="mb-8">
        <RecentActivity activities={activitiesData.content} />
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {activitiesData.empty && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">활동 기록이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            독서를 시작하고 노트를 작성해보세요!
          </p>
        </div>
      )}
    </main>
  );
}

