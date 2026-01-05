'use client';

import { BookOpen, Clock, FileText } from 'lucide-react';
import Image from 'next/image';

interface Activity {
  id: number;
  type: 'note' | 'reading' | 'finished' | 'quote';
  bookTitle: string;
  bookCover: string;
  content?: string;
  pages?: number;
  timestamp: string;
  bookId?: number;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'note':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'reading':
        return <BookOpen className="h-5 w-5 text-primary" />;
      case 'finished':
        return <BookOpen className="h-5 w-5 text-primary" />;
        case 'quote':
          return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'note':
        return '노트 작성';
      case 'reading':
        return activity.pages != null ? `${activity.pages}페이지 읽음` : '읽음';
      case 'finished':
        return '완독';
        case 'quote':
          return '인용구';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="group relative rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
        >
          <div className="flex gap-4">
            {/* 책 표지 썸네일 */}
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded shadow-sm">
              {activity.bookCover ? (
                <Image
                  src={activity.bookCover}
                  alt={activity.bookTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs">
                  {activity.bookTitle.charAt(0)}
                </div>
              )}
            </div>

            {/* 활동 내용 */}
            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm text-muted-foreground">
                    {getActivityText(activity)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>

              <h4 className="mb-1 font-semibold text-sm">{activity.bookTitle}</h4>

              {/* 노트 내용 스니펫 */}
              {activity.content && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  &ldquo;{activity.content}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-muted-foreground">아직 활동 기록이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            독서를 시작하고 노트를 작성해보세요!
          </p>
        </div>
      )}
    </div>
  );
}

