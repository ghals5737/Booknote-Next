import { UserBookResponse } from "@/lib/types/book/book";
import { StatisticsResponse } from "@/lib/types/statistics/statistics";

/**
 * 읽고 있는 책 필터링 
 * - progress가 0보다 크고 100보다 작은 책
 * - 또는 progress가 0이지만 시작일(startDate)이 있는 책 (읽기 시작했지만 아직 진행률이 0인 경우)
 */
export function getReadingBooks(books: UserBookResponse[]) {
  return books.filter(
    (book) => {
      // 진행률이 0보다 크고 100보다 작은 경우
      if (book.progress > 0 && book.progress < 100) {
        return true;
      }
      // 진행률이 0이지만 시작일이 있는 경우 (읽기 시작한 책)
      if (book.progress === 0 && book.startDate) {
        return true;
      }
      return false;
    }
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

