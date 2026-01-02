'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, ChevronDown, Edit3, Music, Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ReadingBook {
  id: number;
  title: string;
  progress: number;
}

interface QuickActionsProps {
  onContinueReading: (bookId?: number) => void;
  onWriteNote: () => void;
  onStartTimer: () => void;
  onPlayMusic: () => void;
  currentBook?: {
    title: string;
    progress: number;
  };
  readingBooks?: ReadingBook[];
  isTimerRunning?: boolean;
  selectedBookId?: number | null;
}

export function QuickActions({ 
  onContinueReading, 
  onWriteNote, 
  onStartTimer,
  onPlayMusic,
  currentBook,
  readingBooks = [],
  isTimerRunning = false,
  selectedBookId
}: QuickActionsProps) {
  // 현재 선택된 책을 제외한 책 목록
  const availableBooks = readingBooks.filter(book => book.id !== selectedBookId);
  const hasMultipleBooks = availableBooks.length > 0;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (buttonRef.current && hasMultipleBooks) {
      const width = buttonRef.current.offsetWidth;
      setDropdownWidth(width);
    }
  }, [hasMultipleBooks]);

  const handleContinueReadingClick = () => {
    if (!hasMultipleBooks) {
      onContinueReading();
    }
  };

  const handleBookSelect = (bookId: number) => {
    onContinueReading(bookId);
  };

  const continueReadingButton = (
    <button
      ref={buttonRef}
      onClick={handleContinueReadingClick}
      disabled={isTimerRunning}
      className="group relative col-span-1 w-full overflow-hidden rounded-lg bg-primary p-5 text-left text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg sm:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm opacity-90">지금 읽던 책 이어서 읽기</span>
          {hasMultipleBooks && (
            <ChevronDown className="h-4 w-4 opacity-75" />
          )}
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
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 이어서 읽기 - 강조 */}
      {hasMultipleBooks ? (
        <DropdownMenu>
          <DropdownMenuTrigger 
            asChild 
            className="sm:col-span-2"
            disabled={isTimerRunning}
          >
            {continueReadingButton}
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            style={{ width: dropdownWidth ? `${dropdownWidth}px` : undefined }}
            className="min-w-[200px]"
          >
            {availableBooks.map((book) => (
              <DropdownMenuItem
                key={book.id}
                onClick={() => handleBookSelect(book.id)}
                className="flex flex-col items-start gap-1 p-3"
                disabled={isTimerRunning}
              >
                <span className="font-medium">{book.title}</span>
                <span className="text-xs text-muted-foreground">{book.progress}% 완료</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        continueReadingButton
      )}

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

