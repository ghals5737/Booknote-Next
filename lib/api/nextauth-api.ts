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
  
  // 상대 경로(/api/...)로 시작하면 Next.js API 라우트로, 아니면 백엔드로 직접 요청
  const url = endpoint.startsWith('/api/') 
    ? endpoint  // Next.js API 라우트 (상대 경로)
    : `${API_BASE_URL}${endpoint}`  // 백엔드 직접 요청 (절대 URL)
  
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
  
  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // 쿠키 포함 (Next.js API 라우트용)
    })
  } catch (error) {
    // 네트워크 오류 등 fetch 자체가 실패한 경우
    console.error('[authenticatedApiRequest] 네트워크 오류:', error)
    throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
  }
  
  // Content-Type 확인 - 서버는 항상 JSON을 반환해야 함
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '')
    console.error('[authenticatedApiRequest] JSON이 아닌 응답:', {
      status: response.status,
      contentType,
      url,
      text: text.substring(0, 200)
    })
    throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다. (${response.status})`)
  }
  
  // JSON 파싱
  let parsedData: unknown
  try {
    parsedData = await response.json()
  } catch (error) {
    console.error('[authenticatedApiRequest] JSON 파싱 실패:', error)
    throw new Error('서버 응답을 파싱할 수 없습니다.')
  }
  
  if (!response.ok) {
    // 에러 응답 형식이 다를 수 있음 (code, message, status 형식 또는 success, message 형식)
    const errorData = parsedData as Record<string, unknown>
    const errorMessage = (errorData?.message as string) || (errorData?.code as string) || `API 요청 실패 (${response.status})`
    throw new Error(errorMessage)
  }
  
  return parsedData as ApiResponse<T>
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
  
  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (error) {
    // 네트워크 오류 등 fetch 자체가 실패한 경우
    console.error('[apiRequest] 네트워크 오류:', error)
    throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
  }
  
  // Content-Type 확인 - 서버는 항상 JSON을 반환해야 함
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '')
    console.error('[apiRequest] JSON이 아닌 응답:', {
      status: response.status,
      contentType,
      url,
      text: text.substring(0, 200)
    })
    throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다. (${response.status})`)
  }
  
  // JSON 파싱
  let parsedData: unknown
  try {
    parsedData = await response.json()
  } catch (error) {
    console.error('[apiRequest] JSON 파싱 실패:', error)
    throw new Error('서버 응답을 파싱할 수 없습니다.')
  }
  
  if (!response.ok) {
    const errorData = parsedData as Record<string, unknown>
    const errorMessage = (errorData?.message as string) || `API 요청 실패 (${response.status})`
    throw new Error(errorMessage)
  }
  
  return parsedData as ApiResponse<T>
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
