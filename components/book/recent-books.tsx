"use client";

import { BookCard } from "@/components/book/book-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserBookResponse } from "../../lib/types/book/book";

interface RecentBooksProps {
  books: UserBookResponse[];
}

// 쓰로틀 함수: 스크롤 이벤트 성능 최적화
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function RecentBooks({ books }: RecentBooksProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 최근 책들을 모두 표시 (한 행에 스크롤 가능)
  const recentBooks = useMemo(
    () =>
      books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.coverImage || "/placeholder.svg",
        progress: book.progress,
        currentPage: book.currentPage,
        totalPages: book.totalPages,
        note: `${book.noteCnt}개 노트`,
        rating: book.rating || 0,
      })),
    [books]
  );

  // 스크롤 상태 업데이트 (쓰로틀링 적용)
  const handleScroll = throttle(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const threshold = 10; // 스크롤 여유 공간
      setShowLeftArrow(scrollLeft > threshold);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold);
    }
  }, 100);

  // 스크롤 함수 (카드 너비 기반 스크롤)
  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // 반응형 카드 너비 계산 (모바일: 280px, 데스크톱: 320px)
        const isMobile = window.innerWidth < 640;
        const cardWidth = isMobile ? 280 : 320;
        const gap = 16;
        const scrollAmount = cardWidth + gap;
        
        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    },
    []
  );

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll("right");
      }
    },
    [scroll]
  );

  // 초기 및 리사이즈 시 스크롤 상태 확인
  useEffect(() => {
    const checkScrollState = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const threshold = 10;
        setShowLeftArrow(scrollLeft > threshold);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold);
      }
    };

    // 초기 확인
    checkScrollState();

    // 리사이즈 이벤트 (디바운싱)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkScrollState, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [recentBooks.length]);

  if (recentBooks.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">최근 읽은 책</h2>
        <a
          href="#"
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          전체 보기
        </a>
      </div>
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="최근 읽은 책 캐러셀"
      >
        {/* 왼쪽 페이드 그라데이션 */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-2 w-20 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-[5]" />
        )}

        {/* 왼쪽 화살표 버튼 */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm p-2 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100 ${
              isHovered ? "opacity-100" : ""
            }`}
            aria-label="이전 책 보기"
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* 스크롤 컨테이너 */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory items-stretch"
          style={{
            scrollPaddingLeft: "1rem",
            scrollPaddingRight: "1rem",
          }}
          role="list"
          aria-label="최근 읽은 책 목록"
        >
          {recentBooks.map((book) => (
            <div
              key={book.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start h-full"
              role="listitem"
            >
              <BookCard book={book} variant="recent" />
            </div>
          ))}
        </div>

        {/* 오른쪽 페이드 그라데이션 */}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-2 w-20 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-[5]" />
        )}

        {/* 오른쪽 화살표 버튼 */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm p-2 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100 ${
              isHovered ? "opacity-100" : ""
            }`}
            aria-label="다음 책 보기"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
