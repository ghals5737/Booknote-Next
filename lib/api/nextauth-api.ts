// NextAuth.js 기반 API 요청 헬퍼

import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100'

export interface ApiResponse<T> {
  data: T
  success: boolean
  status: number
  message: string
}

// NextAuth.js 세션에서 토큰을 가져와서 API 요청
export const authenticatedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const session = await getSession()
  
  if (!session?.accessToken) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
  }
  
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.accessToken}`,
  }
  
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  
  console.log('[authenticatedApiRequest] URL:', url)
  console.log('[authenticatedApiRequest] Headers:', headers)
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API 요청 실패')
  }
  
  return data
}

// 인증이 필요하지 않은 API 요청
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  
  console.log('[apiRequest] URL:', url)
  console.log('[apiRequest] Headers:', headers)
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API 요청 실패')
  }
  
  return data
}

// NextAuth.js 세션에서 토큰을 가져오는 헬퍼
export const getAuthToken = async (): Promise<string | null> => {
  const session = await getSession()
  return session?.accessToken || null
}

// NextAuth.js 세션에서 사용자 정보를 가져오는 헬퍼
export const getAuthUser = async () => {
  const session = await getSession()
  return session?.user || null
}
