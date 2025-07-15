"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNextAuth } from "@/hooks/use-next-auth"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { resetPassword, isLoading } = useNextAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("이메일을 입력해주세요.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.")
      return
    }

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 재설정에 실패했습니다.")
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-secondary bg-card shadow-soft-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-scale-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">이메일을 확인하세요</h2>
            <p className="text-cool mb-6 leading-relaxed">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
              <br />
              이메일을 확인하고 안내에 따라 비밀번호를 재설정해주세요.
            </p>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-secondary bg-card shadow-soft-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gradient">비밀번호 재설정</CardTitle>
        <p className="text-cool">가입하신 이메일 주소를 입력해주세요</p>
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

          <Button type="submit" className="w-full button-primary rounded-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                전송 중...
              </>
            ) : (
              "재설정 링크 보내기"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full text-cool hover:text-foreground hover:bg-secondary"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            로그인으로 돌아가기
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
