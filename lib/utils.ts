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