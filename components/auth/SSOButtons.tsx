"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/context/AuthContext"

const ssoProviders = [
  {
    id: "google" as const,
    name: "Google",
    icon: "🔍",
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
  {
    id: "github" as const,
    name: "GitHub",
    icon: "🐙",
    bgColor: "bg-gray-900 hover:bg-gray-800",
    textColor: "text-white",
    borderColor: "border-gray-900",
  },
  {
    id: "kakao" as const,
    name: "카카오",
    icon: "💬",
    bgColor: "bg-yellow-400 hover:bg-yellow-500",
    textColor: "text-gray-900",
    borderColor: "border-yellow-400",
  },
  {
    id: "naver" as const,
    name: "네이버",
    icon: "🟢",
    bgColor: "bg-green-500 hover:bg-green-600",
    textColor: "text-white",
    borderColor: "border-green-500",
  },
]

export function SSOButtons() {
  const { loginWithProvider, isLoading } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSSOLogin = async (provider: "google" | "github" | "kakao" | "naver") => {
    setLoadingProvider(provider)
    try {
      await loginWithProvider(provider)
    } catch (error) {
      console.error(`${provider} login failed:`, error)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-secondary" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-cool">또는</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ssoProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            onClick={() => handleSSOLogin(provider.id)}
            disabled={isLoading || loadingProvider !== null}
            className={`
              ${provider.bgColor} ${provider.textColor} ${provider.borderColor}
              transition-all duration-200 hover:scale-105 disabled:hover:scale-100
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loadingProvider === provider.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="text-lg mr-2">{provider.icon}</span>
                <span className="text-sm font-medium">{provider.name}</span>
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
