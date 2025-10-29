"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"

interface RegisterFormProps {
  readonly onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("모든 필드를 입력해주세요.")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError("이용약관에 동의해주세요.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "회원가입에 실패했습니다.")
        setIsLoading(false)
        return
      }

      const data = await response.json()
      
      if (data.success) {
        // 회원가입 성공 후 자동 로그인
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          globalThis.location.href = "/books"
        } else {
          setError("회원가입은 성공했지만 자동 로그인에 실패했습니다. 로그인 페이지에서 다시 로그인해주세요.")
        }
      } else {
        setError(data.message || "회원가입에 실패했습니다.")
      }
    } catch {
      setError("회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-md border-secondary bg-card shadow-soft-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gradient">회원가입</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-cool font-medium">
              이름
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="이름을 입력하세요"
                className="pl-10 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cool font-medium">
              이메일
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="비밀번호를 입력하세요 (8자 이상)"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-cool font-medium">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="pl-10 pr-10 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-cool" /> : <Eye className="h-4 w-4 text-cool" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="terms" className="text-sm text-cool">
              <span>이용약관</span> 및 <span>개인정보처리방침</span>에 동의합니다
            </Label>
          </div>

          <Button type="submit" className="w-full button-primary rounded-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </Button>

          <div className="text-center text-sm text-cool">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-accent hover:text-accent/80 font-medium transition-colors"
              disabled={isLoading}
            >
              로그인
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
