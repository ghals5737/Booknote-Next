"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, Calendar, Camera, FileText, LogOut, Mail, Quote, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "독서 애호가",
    email: "reader@booknote.com",
    bio: "책을 사랑하는 사람입니다.",
  })

  const stats = [
    {
      icon: BookOpen,
      label: "읽은 책",
      value: 24,
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FileText,
      label: "작성한 노트",
      value: 156,
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Quote,
      label: "저장한 인용구",
      value: 89,
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Calendar,
      label: "연속 독서",
      value: "12일",
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />내 서재로 돌아가기
        </Link>

        <div className="space-y-6">
          {/* Profile Card */}
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
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">소개</Label>
                        <Input
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      <Button onClick={() => setIsEditing(true)}>프로필 편집</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Settings Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">설정</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  알림 설정
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  독서 목표 설정
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  테마 변경
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  데이터 내보내기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="p-6">
              <Button variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
