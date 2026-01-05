import { clsx, type ClassValue } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateYMD = (isoLike: string | undefined | null) => {
  if (!isoLike) return "";
  // 서버/클라 동일 기준: UTC로 고정
  return moment.utc(isoLike).format("YYYY-MM-DD");
};

export const getUtcTime = (isoLike: string | undefined | null) => {
  if (!isoLike) return 0;
  return moment.utc(isoLike).valueOf(); // 정렬용
};

export const formatRelativeDate = (isoLike: string | undefined | null): string => {
  if (!isoLike) return "";
  const now = moment();
  const date = moment(isoLike);
  const diffDays = now.diff(date, 'days');
  
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 14) return "1주 전";
  if (diffDays < 21) return "2주 전";
  if (diffDays < 30) return "3주 전";
  if (diffDays < 60) return "1개월 전";
  if (diffDays < 90) return "2개월 전";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
};

export const formatKoreanDate = (isoLike: string | undefined | null): string => {
  if (!isoLike) return "";
  return moment(isoLike).format("YYYY년 M월 D일");
};