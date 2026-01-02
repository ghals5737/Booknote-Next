import { UserBookResponse } from "@/lib/types/book/book";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";

/**
 * 읽고 있는 책 필터링 (progress > 0 && progress < 100)
 */
export function getReadingBooks(books: UserBookResponse[]) {
  return books.filter(
    (book) => book.progress > 0 && book.progress < 100
  );
}

/**
 * 이번달 읽은 책 수 계산
 */
export function getThisMonthReadCount(statisticsData: StatisticsResponse | null): number {
  if (!statisticsData?.monthly) return 0;
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const thisMonthData = statisticsData.monthly.find(
    (item) => item.year === currentYear && item.month === currentMonth
  );
  return thisMonthData?.readCount || 0;
}

/**
 * 올해 읽은 책 수 계산
 */
export function getThisYearReadCount(statisticsData: StatisticsResponse | null): number {
  if (!statisticsData?.monthly) return 0;
  const currentYear = new Date().getFullYear().toString();
  return statisticsData.monthly
    .filter((item) => item.year === currentYear)
    .reduce((sum, item) => sum + item.readCount, 0);
}

