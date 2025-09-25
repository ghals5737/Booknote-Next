"use client"

import { Toaster } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { createContext, ReactNode, useContext } from "react"

interface ToastContextType {
  toast: (options: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' | 'warning' }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toast, dismiss, toasts } = useToast()

  const showToast = (options: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' | 'warning' }) => {
    return toast(options)
  }

  return (
    <ToastContext.Provider value={{ toast: showToast, dismiss }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
