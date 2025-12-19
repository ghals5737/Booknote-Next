// 통계 API 응답 타입 정의

export interface StatSummary {
  totalBooks: number;
  readBooks: number;
  totalPages: number;
  totalNotes: number;
}

export interface MonthlyStat {
  year: string;
  month: string;
  readCount: number;
  pageCount: number;
  label: string;
}

export interface CategoryStat {
  categoryCode: string;
  categoryName: string;
  count: number;
}

export interface StatisticsResponse {
  summary: StatSummary;
  monthly: MonthlyStat[];
  category: CategoryStat[];
}

export interface StatisticsApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: StatisticsResponse;
  timestamp: string;
}

