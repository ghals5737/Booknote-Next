"use client"

import { useIsMobile } from '@/hooks/use-mobile'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface SidebarContextType {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  // 모바일에서는 기본적으로 닫힌 상태, 데스크톱에서는 열린 상태
  useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setIsOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const openSidebar = () => {
    setIsOpen(true)
  }

  return (
    <SidebarContext.Provider value={{
      isOpen,
      toggleSidebar,
      closeSidebar,
      openSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
