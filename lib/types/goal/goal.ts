// 독서 목표 API 타입 정의

export type GoalType = 'monthly' | 'yearly';

export interface GoalResponse {
  id: number;
  type: GoalType;
  target: number;
  current: number;
  year: number;
  month?: number; // monthly일 때만 존재
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface GoalsResponse {
  monthly: GoalResponse | null;
  yearly: GoalResponse | null;
}

export interface GoalsApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: GoalsResponse;
  timestamp: string;
}

export interface CreateGoalRequest {
  type: GoalType;
  target: number; // 1 이상
  year: number; // 필수
  month?: number; // monthly일 때만 필수 (1-12)
}

export interface CreateGoalResponse {
  id: number;
  type: GoalType;
  target: number;
  year: number;
  month?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CreateGoalResponse;
  timestamp: string;
}

export interface DeleteGoalApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export interface FieldError {
  field: string;
  error: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  fieldErrors?: FieldError[];
}

