/**
 * 복습 관련 날짜 계산 유틸리티 함수
 */

/**
 * 날짜 간 일수 차이 계산
 */
export function calculateDaysDiff(date1: Date, date2: Date = new Date()): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 마지막 복습일 계산
 * @param completedTime 항목 완료 시간
 * @param noteStartDate 노트 생성일 (대체용)
 * @returns 마지막 복습일 Date 객체 또는 null
 */
export function getLastReviewDate(
  completedTime: string | null | undefined,
  noteStartDate?: string | null
): Date | null {
  // 1. completedTime이 있으면 그것 사용
  if (completedTime) {
    return new Date(completedTime)
  }
  
  // 2. 없으면 노트 생성일 사용 (첫 복습으로 간주)
  if (noteStartDate) {
    return new Date(noteStartDate)
  }
  
  return null
}

/**
 * "X일 전 복습" 같은 텍스트 생성
 * @param lastReviewDate 마지막 복습일
 * @returns 표시용 텍스트
 */
export function getLastReviewText(lastReviewDate: Date | null): string {
  if (!lastReviewDate) {
    return "첫 복습"
  }
  
  const daysDiff = calculateDaysDiff(lastReviewDate)
  
  if (daysDiff === 0) {
    return "오늘 복습"
  } else if (daysDiff === 1) {
    return "어제 복습"
  } else if (daysDiff < 7) {
    return `${daysDiff}일 전 복습`
  } else if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7)
    return `${weeks}주 전 복습`
  } else if (daysDiff < 365) {
    const months = Math.floor(daysDiff / 30)
    return `${months}개월 전 복습`
  } else {
    const years = Math.floor(daysDiff / 365)
    return `${years}년 전 복습`
  }
}

/**
 * 날짜를 시간 제외하고 비교 (날짜만)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * 예정 복습일 텍스트 생성
 * @param plannedTime 예정 복습일 (ISO string)
 * @returns 표시용 텍스트
 */
export function getPlannedReviewText(plannedTime: string): string {
  const plannedDate = new Date(plannedTime)
  const now = new Date()
  
  // 날짜만 비교 (시간 제외)
  const plannedDateOnly = new Date(plannedDate.getFullYear(), plannedDate.getMonth(), plannedDate.getDate())
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // 오늘인 경우
  if (isSameDay(plannedDate, now)) {
    return "오늘 복습 예정"
  }
  
  const daysDiff = Math.floor((plannedDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24))
  
  // 과거면 "연체" 표시 (0일이 아닌 경우만)
  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff)
    return absDays === 0 ? "오늘 복습 예정" : `연체됨 (${absDays}일 지남)`
  }
  
  if (daysDiff === 0) {
    return "오늘 복습 예정"
  } else if (daysDiff === 1) {
    return "내일 복습 예정"
  } else if (daysDiff < 7) {
    return `${daysDiff}일 후 복습 예정`
  } else {
    return `${plannedDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 복습 예정`
  }
}

/**
 * 복습 횟수 텍스트 생성
 * @param reviewCount 복습 횟수 (이미 몇 번째인지 나타내는 값)
 * @returns 표시용 텍스트
 */
export function getReviewCountText(reviewCount: number | undefined): string | null {
  if (reviewCount === undefined || reviewCount === null) {
    return null
  }
  
  if (reviewCount === 0 || reviewCount === 1) {
    return "첫 복습"
  } else {
    return `${reviewCount}번째 복습`
  }
}

