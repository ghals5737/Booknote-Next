"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"

interface LoginFormProps {
  readonly onToggleMode: () => void
  readonly onForgotPassword: () => void
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (result?.ok) {
        // 로그인 성공 시 /books로 리다이렉트
        globalThis.location.href = "/dashboard"
      }
    } catch {
      setError("로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-secondary bg-card shadow-soft-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gradient">로그인</CardTitle>

      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cool font-medium">
              이메일
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="pl-10 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-cool font-medium">
              비밀번호
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="pl-10 pr-10 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-cool" /> : <Eye className="h-4 w-4 text-cool" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-accent hover:text-accent/80 transition-colors"
              disabled={isLoading}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <Button type="submit" className="w-full button-primary rounded-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>

          <div className="text-center text-sm text-cool">
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-accent hover:text-accent/80 font-medium transition-colors"
              disabled={isLoading}
            >
              회원가입
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
