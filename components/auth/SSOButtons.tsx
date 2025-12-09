"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"

const ssoProviders = [
  {
    id: "google" as const,
    name: "Google",
    icon: "🔍",
    bgColor: "bg-white hover:bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
]

export function SSOButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSSOLogin = async (provider: "google") => {
    setLoadingProvider(provider)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
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

      <div className="grid grid-cols-1 gap-3">
        {ssoProviders.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            onClick={() => handleSSOLogin(provider.id)}
            disabled={loadingProvider !== null}
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
