"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { ForgotPasswordForm } from "./ForgotPasswordForm"
import { SSOButtons } from "./SSOButtons"

type AuthMode = "login" | "register" | "forgot-password"

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")

  const renderForm = () => {
    switch (mode) {
      case "login":
        return (
          <div className="space-y-6">
            <LoginForm onToggleMode={() => setMode("register")} onForgotPassword={() => setMode("forgot-password")} />
            <SSOButtons />
          </div>
        )
      case "register":
        return (
          <div className="space-y-6">
            <RegisterForm onToggleMode={() => setMode("login")} />
            <SSOButtons />
          </div>
        )
      case "forgot-password":
        return <ForgotPasswordForm onBack={() => setMode("login")} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Brand */}
        <div className="text-center animate-slide-up">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-soft-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Booknote</h1>
          <p className="text-cool text-lg">Smart Reading Companion</p>
        </div>

        {/* Auth Forms */}
        <div className="animate-slide-up animation-delay-200">{renderForm()}</div>

        {/* Footer */}
        <div className="text-center text-sm text-cool/70 animate-slide-up animation-delay-400">
          <p>© 2024 Booknote. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="hover:text-accent transition-colors">이용약관</button>
            <button className="hover:text-accent transition-colors">개인정보처리방침</button>
            <button className="hover:text-accent transition-colors">고객지원</button>
          </div>
        </div>
      </div>
    </div>
  )
}
