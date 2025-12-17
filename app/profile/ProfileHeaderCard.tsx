"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Mail, User } from "lucide-react"
import { useState } from "react"

type Profile = {
  name: string
  email: string
  bio: string
}

interface ProfileHeaderCardProps {
  value: Profile
  onChange: (next: Profile) => void
}

export function ProfileHeaderCard({ value, onChange }: ProfileHeaderCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    // TODO: 실제 저장 로직 추가
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Profile Image */}
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={value.name}
                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={value.email}
                    onChange={(e) => onChange({ ...value, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Input
                    id="bio"
                    value={value.bio}
                    onChange={(e) => onChange({ ...value, bio: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>저장</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h1 className="text-2xl font-bold">{value.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {value.email}
                </div>
                <p className="text-sm text-muted-foreground">{value.bio}</p>
                <Button onClick={() => setIsEditing(true)}>프로필 편집</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
