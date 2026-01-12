'use client';

import { BookOpen, Check, FileText, Quote } from 'lucide-react';
import { ActivityResponse } from '@/lib/types/dashboard/dashboard';

interface RecentActivityListProps {
  activities: ActivityResponse[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const getActivityIcon = (type: ActivityResponse['type']) => {
    switch (type) {
      case 'quote':
        return <Quote className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'finished':
        return <Check className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getActivityIconColor = (type: ActivityResponse['type']) => {
    switch (type) {
      case 'note':
        return 'text-[#8A9A7B]';
      case 'reading':
        return 'text-[#9B8B7E]';
      case 'finished':
        return 'text-[#B85C4F]';
      case 'quote':
        return 'text-[#C9A961]';
    }
  };

  const getActivityText = (activity: ActivityResponse) => {
    switch (activity.type) {
      case 'note':
        return '노트 작성';
      case 'reading':
        return `${activity.pages || 0}p`;
      case 'finished':
        return '완독';
      case 'quote':
        return '인용구';
      default:
        return '활동';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day.toString().padStart(2, '0')}`;
  };

  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#2C2416]">
          최근 활동
        </h2>
      </div>
      <div className="space-y-2">
        {activities.slice(0, 4).map((activity) => (
          <button
            key={activity.id}
            className="group w-full text-left rounded-lg border border-border/30 bg-card/20 px-4 py-3 transition-all duration-200 hover:border-border/60 hover:bg-card/40 h-[72px] flex items-center"
          >
            <div className="flex items-center gap-3 w-full">
              {/* 아이콘 */}
              <div className={`flex-shrink-0 ${getActivityIconColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* 활동 타입 */}
              <span className="flex-shrink-0 text-sm text-muted-foreground">
                {getActivityText(activity)}
              </span>

              {/* 구분선 */}
              <div className="h-3 w-px bg-border/40"></div>

              {/* 책 제목 */}
              <span className="min-w-0 flex-1 truncate font-serif text-sm text-[#2C2416]">
                {activity.bookTitle}
              </span>

              {/* 시간 */}
              <span className="flex-shrink-0 text-xs text-muted-foreground/60">
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
          </button>
        ))}

        {activities.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 bg-card/20 py-8 text-center h-[72px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground/60">
              아직 활동 기록이 없습니다
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
