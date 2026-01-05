'use client';

import { ArrowRight, BookOpen, Check, Clock, FileText, Quote } from 'lucide-react';

interface Activity {
  id: number;
  type: 'note' | 'reading' | 'finished' | 'quote';
  bookTitle: string;
  bookCover: string;
  content?: string;
  pages?: number;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'note':
        return <FileText className="h-5 w-5" />;
      case 'reading':
        return <BookOpen className="h-5 w-5" />;
      case 'finished':
        return <Check className="h-5 w-5" />;
      case 'quote':
        return <Quote className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'note':
        return '[--activity-bar:#8A9A7B]'; // 세이지 그린
      case 'reading':
        return '[--activity-bar:#9B8B7E]'; // 웜 그레이
      case 'finished':
        return '[--activity-bar:#B85C4F]'; // 테라코타
      case 'quote':
        return '[--activity-bar:#C9A961]'; // 앤티크 골드
    }
  };

  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'note':
        return 'bg-[#F3F5F1]';
      case 'reading':
        return 'bg-card';
      case 'finished':
        return 'bg-[#F9F0EE]';
      case 'quote':
        return 'bg-[#FAF6ED]';
    }
  };

  const getActivityIconColor = (type: Activity['type']) => {
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

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'note':
        return '노트 작성';
      case 'reading':
        if (activity.pages != null && activity.pages > 0) {
          return `${activity.pages}페이지 읽음`;
        }
        return '읽음';
      case 'finished':
        return '완독';
      case 'quote':
        return '인용구 저장';
      default:
        return '활동';
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
    <div className="relative -mx-6 px-6">
      {/* 가로 스크롤 컨테이너 */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {activities.map((activity) => (
          <button
            key={activity.id}
            className={`group relative flex-shrink-0 w-[320px] cursor-pointer overflow-hidden rounded-xl border border-border/50 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg ${getActivityBgColor(activity.type)} ${getActivityColor(activity.type)}`}
          >
            {/* 상단 컬러 바 - CSS 변수 사용 */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[var(--activity-bar)]"></div>
            
            <div className="flex flex-col gap-4 p-5 pt-6">
              {/* 상단: 활동 타입 강조 + 시간 */}
              <div className="flex h-8 items-start justify-between gap-3">
                <div className={`flex items-center gap-2.5 ${getActivityIconColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                  <span className="text-lg font-semibold">
                    {getActivityText(activity)}
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>

              {/* 구분선 */}
              <div className="h-px bg-border/50"></div>

              {/* 중앙: 책 정보 (컴팩트) */}
              <div className="flex gap-3">
                {/* 작은 썸네일 */}
                <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded shadow-sm">
                  <img 
                    src={activity.bookCover} 
                    alt={activity.bookTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* 책 제목 */}
                <div className="flex min-w-0 flex-1 items-center">
                  <h4 className="line-clamp-2 font-serif font-medium leading-snug">{activity.bookTitle}</h4>
                </div>
              </div>

              {/* 하단: 활동 내용 스니펫 */}
              {activity.content && (
                <>
                  <div className="h-px bg-border/50"></div>
                  <p className={`line-clamp-2 text-sm leading-relaxed text-muted-foreground ${
                    activity.type === 'quote' ? 'font-serif italic' : ''
                  }`}>
                    {activity.type === 'quote' ? `"${activity.content}"` : activity.content}
                  </p>
                </>
              )}

              {/* 호버 시 화살표 */}
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </button>
        ))}

        {activities.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="mb-1 font-medium text-muted-foreground">아직 활동 기록이 없습니다</p>
            <p className="text-sm text-muted-foreground/70">
              독서를 시작하고 노트를 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

