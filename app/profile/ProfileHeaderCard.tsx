"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authenticatedApiRequest } from "@/lib/api/nextauth-api"
import { UserInfo } from "@/lib/types/user/profile"
import { Camera, Mail, User } from "lucide-react"
import { useState } from "react"

type Profile = {
  name: string
  email: string
  bio: string
  nickname: string
  profileImgUrl: string
}

interface ProfileHeaderCardProps {
  value: Profile
  onChange: (next: Profile) => void
  onUpdate?: () => void // 프로필 업데이트 후 콜백
}

export function ProfileHeaderCard({ value, onChange, onUpdate }: ProfileHeaderCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await authenticatedApiRequest<{ user: UserInfo }>("/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: value.name,
          bio: value.bio,
          nickname: value.nickname,
          profileImgUrl: value.profileImgUrl,
        }),
      })

      // 응답에서 업데이트된 데이터로 상태 업데이트
      if (response.data?.user) {
        onChange({
          ...value,
          name: response.data.user.name,
          bio: response.data.user.bio || "",
          nickname: response.data.user.nickname || "",
          profileImgUrl: response.data.user.profileImage || "",
        })
      }

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 업데이트되었습니다.",
        variant: "success",
      })
      setIsEditing(false)
      
      // 부모 컴포넌트에 업데이트 알림
      onUpdate?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "프로필 수정에 실패했습니다."
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("[ProfileHeaderCard] 프로필 수정 실패:", error)
    } finally {
      setIsSaving(false)
    }
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
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
                </div>
                <div>
                  <Label htmlFor="nickname">닉네임</Label>
                  <Input
                    id="nickname"
                    value={value.nickname}
                    onChange={(e) => onChange({ ...value, nickname: e.target.value })}
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
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl font-bold">{value.name}</h1>
                  {value.nickname && (
                    <p className="text-sm text-muted-foreground">@{value.nickname}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {value.email}
                </div>
                {value.bio && (
                  <p className="text-sm text-muted-foreground">{value.bio}</p>
                )}
                <Button onClick={() => setIsEditing(true)}>프로필 편집</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
