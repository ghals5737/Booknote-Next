"use client"

import { authenticatedApiRequest } from "@/lib/api/nextauth-api"
import { UserInfo } from "@/lib/types/user/profile"
import { Camera } from "lucide-react"
import Image from "next/image"
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
  onUpdate?: () => void
}

export function ProfileHeaderCard({ value, onChange, onUpdate }: ProfileHeaderCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

      setIsEditing(false)
      onUpdate?.()
    } catch (error) {
      console.error("[ProfileHeaderCard] 프로필 수정 실패:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      {isEditing ? (
        /* 편집 모드 */
        <div className="space-y-5">
          <div className="flex items-start gap-8">
            {/* 프로필 이미지 */}
            <div className="group relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary/30 transition-all">
                {value.profileImgUrl ? (
                  <Image
                    src={value.profileImgUrl}
                    alt={value.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-3xl text-muted-foreground/70">
                    {value.name.charAt(0)}
                  </span>
                )}
              </div>
              <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* 편집 폼 */}
            <div className="flex-1 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">이름</label>
                  <input
                    type="text"
                    value={value.name}
                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3.5 py-2 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">닉네임</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground/50">@</span>
                    <input
                      type="text"
                      value={value.nickname}
                      onChange={(e) => onChange({ ...value, nickname: e.target.value })}
                      className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3.5 py-2 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>

              {/* 이메일 (읽기 전용) */}
              <div>
                <label className="mb-2 block text-xs text-muted-foreground">이메일</label>
                <div className="rounded-lg border border-border/30 bg-secondary/10 px-3.5 py-2">
                  <span className="text-sm text-muted-foreground">{value.email}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground/60">이메일은 변경할 수 없습니다</p>
              </div>

              {/* 소개 */}
              <div>
                <label className="mb-2 block text-xs text-muted-foreground">소개</label>
                <textarea
                  value={value.bio}
                  onChange={(e) => onChange({ ...value, bio: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border/50 bg-background/50 px-3.5 py-2 text-sm leading-relaxed transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10"
                  placeholder="한 줄 소개를 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 border-t border-border/30 pt-5">
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground disabled:opacity-40"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-foreground px-5 py-2 text-sm text-background transition-all hover:bg-foreground/90 disabled:opacity-40"
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      ) : (
        /* 읽기 모드 */
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* 프로필 이미지 */}
            <div className="shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary/30">
                {value.profileImgUrl ? (
                  <Image
                    src={value.profileImgUrl}
                    alt={value.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-2xl text-muted-foreground/70">
                    {value.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="space-y-1.5">
              <div>
                <h1 className="font-serif text-2xl">{value.name}</h1>
                {value.nickname && (
                  <p className="mt-0.5 text-sm text-muted-foreground/60">@{value.nickname}</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground/70">{value.email}</p>

              {value.bio && (
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{value.bio}</p>
              )}
            </div>
          </div>

          {/* 편집 버튼 */}
          <button
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded-lg border border-border/50 bg-background/50 px-4 py-2 text-sm transition-all hover:border-border hover:bg-background"
          >
            편집
          </button>
        </div>
      )}
    </div>
  )
}
