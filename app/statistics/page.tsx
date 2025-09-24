import { SWRProvider } from '@/components/providers/SWRProvider';
import { Suspense } from 'react';
import { StatisticsClient } from './StatisticsClient';

export default function StatisticsPage() {
  return (
    <SWRProvider>
      <Suspense fallback={
        <div className="p-6 space-y-6 bg-background min-h-full">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>통계를 불러오는 중...</span>
            </div>
          </div>
        </div>
      }>
        <StatisticsClient />
      </Suspense>
    </SWRProvider>
  );
}