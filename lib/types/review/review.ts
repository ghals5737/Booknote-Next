// 리뷰(복습) 관련 타입 정의

import { NoteResponse } from "../note/note";
import { QuoteResponse } from "../quote/quote";

export type ReviewItemType = "NOTE" | "QUOTE";

export interface ReviewItem {
  id: number;
  reviewId: number;
  itemType: ReviewItemType;
  itemId: number;
  completed: boolean;
  completedTime: string | null;
  note: NoteResponse | null;
  quote: QuoteResponse | null;
  bookTitle: string | null;
  lastReviewTime?: string | null;  // 마지막 복습 시간 (백엔드 개선 시 제공)
  reviewCount?: number;             // 복습 횟수 (백엔드 개선 시 제공)
}

export interface Review {
  id: number;
  plannedTime: string; 
  completedTime: string | null;
  items: ReviewItem[];
  nextReviewDate?: string;  // 다음 복습 예정일 (YYYY-MM-DD 형식)
}

export interface ReviewTodayResponse {
  success: boolean;
  status: number;
  message: string;
  data: Review;  // 배열에서 단일 객체로 변경
  timestamp: string | null;
}

// UI에서 사용하는 ReviewItem 타입 (기존 구조와 호환)
export interface UIReviewItem {
  id: number;
  reviewId: number;               // 복습 ID
  type: ReviewItemType;
  content: string;
  source: string;
  page?: number;
  date: string;
  tags: string[];
  title?: string;
  dueDate?: string;              // 예정 복습일
  frequency?: string;
  status?: "overdue" | "pending" | "completed";
  itemId: number;
  bookId?: number;
  completedTime?: string | null;
  lastReviewTime?: string | null; 
  reviewCount?: number;           
  lastReviewText?: string;        
}
