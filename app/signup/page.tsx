"use client"

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <RegisterForm onToggleMode={() => { window.location.href = '/auth' }} />
      </div>
    </div>
  )
}
