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
}

export interface Review {
  id: number;
  plannedTime: string; 
  completedTime: string | null;
  items: ReviewItem[];
}

export interface ReviewTodayResponse {
  success: boolean;
  status: number;
  message: string;
  data: Review[];
  timestamp: string | null;
}

// UI에서 사용하는 ReviewItem 타입 (기존 구조와 호환)
export interface UIReviewItem {
  id: number;
  type: ReviewItemType;
  content: string;
  source: string;
  page?: number;
  date: string;
  tags: string[];
  title?: string;
  dueDate?: string;
  frequency?: string;
  status?: "overdue" | "pending" | "completed";
  itemId: number;
  bookId?: number;
}
