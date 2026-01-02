'use client';

import { BookOpen, Edit3, Music, Timer } from 'lucide-react';

interface QuickActionsProps {
  onContinueReading: () => void;
  onWriteNote: () => void;
  onStartTimer: () => void;
  onPlayMusic: () => void;
  currentBook?: {
    title: string;
    progress: number;
  };
}

export function QuickActions({ 
  onContinueReading, 
  onWriteNote, 
  onStartTimer,
  onPlayMusic,
  currentBook 
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 이어서 읽기 - 강조 */}
      <button
        onClick={onContinueReading}
        className="group relative col-span-1 overflow-hidden rounded-lg bg-primary p-5 text-left text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg sm:col-span-2"
      >
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm opacity-90">지금 읽던 책 이어서 읽기</span>
          </div>
          {currentBook && (
            <>
              <h3 className="mb-1 font-semibold text-lg">{currentBook.title}</h3>
              <div className="text-sm opacity-75">{currentBook.progress}% 완료</div>
            </>
          )}
        </div>
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </button>

      {/* 노트 작성 */}
      <button
        onClick={onWriteNote}
        className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
      >
        <Edit3 className="mb-2 h-5 w-5 text-primary" />
        <div>
          <div className="text-sm text-muted-foreground">오늘의</div>
          <div className="font-medium">노트 작성</div>
        </div>
      </button>

      {/* 독서 타이머 */}
      <button
        onClick={onStartTimer}
        className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
      >
        <Timer className="mb-2 h-5 w-5 text-primary" />
        <div>
          <div className="text-sm text-muted-foreground">독서</div>
          <div className="font-medium">타이머 시작</div>
        </div>
      </button>

      {/* 분위기 음악 (선택적) */}
      <button
        onClick={onPlayMusic}
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md sm:col-span-2 lg:col-span-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Music className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">독서 분위기 조성</div>
          <div className="font-medium">잔잔한 클래식 음악 재생</div>
        </div>
      </button>
    </div>
  );
}

