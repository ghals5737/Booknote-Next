"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
  text?: string
  className?: string
}

export function Loading({ size = "md", variant = "spinner", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <div className="flex space-x-1">
          <div className={cn("bg-primary rounded-full animate-bounce", size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3")} style={{ animationDelay: "0ms" }} />
          <div className={cn("bg-primary rounded-full animate-bounce", size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3")} style={{ animationDelay: "150ms" }} />
          <div className={cn("bg-primary rounded-full animate-bounce", size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3")} style={{ animationDelay: "300ms" }} />
        </div>
        {text && <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("bg-primary rounded-full animate-pulse", sizeClasses[size])} />
        {text && <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>{text}</span>}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
  className?: string
}

export function LoadingPage({ text = "로딩 중...", className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

interface LoadingCardProps {
  text?: string
  className?: string
}

export function LoadingCard({ text = "로딩 중...", className }: LoadingCardProps) {
  return (
    <div className={cn("p-6 flex items-center justify-center", className)}>
      <Loading text={text} />
    </div>
  )
}
