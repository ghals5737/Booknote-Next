// 사용자 프로필 관련 타입 정의

export interface UserInfo {
  id: string
  email: string
  name: string
  profileImage: string | null
  nickname: string | null
  bio: string | null
  provider: string
  createdAt: string // LocalDateTime은 ISO 8601 문자열로 변환됨
  lastLoginAt: string | null
}

export interface ProfileStats {
  totalBooks: number
  readingBooks: number
  finishedBooks: number
  totalNotes: number
  totalQuotes: number
  readingStreak: number
  totalReadingTime: number // 시간 단위
}

export interface UserProfileResponse {
  user: UserInfo
  stats: ProfileStats
}

export interface UserProfileRequest {
  bio: string
  nickname: string
  name: string
  profileImgUrl: string
}

