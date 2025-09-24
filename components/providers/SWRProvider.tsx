"use client"

import { authenticatedApiRequest } from '@/lib/api/auth'
import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          const response = await authenticatedApiRequest(url);
          return response.data;
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
} 