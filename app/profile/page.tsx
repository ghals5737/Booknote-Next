"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, BookOpen, Calendar, Camera, FileText, LogOut, Mail, Quote, User, Bell } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "독서 애호가",
    email: "reader@booknote.com",
    bio: "책을 사랑하는 사람입니다.",
  })
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState("08:00")

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

          {/* Reminder Settings Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">리마인더 설정</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-6">
                {/* 매일 알림 받기 스위치 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-reminder" className="text-base font-medium">
                      매일 알림 받기
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      매일 오늘의 발견을 알림으로 받아보세요
                    </p>
                  </div>
                  <Switch
                    id="daily-reminder"
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                  />
                </div>

                {/* 알림 시간 선택 */}
                {reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time" className="text-base font-medium">
                      알림 시간
                    </Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger id="reminder-time" className="w-full">
                        <SelectValue placeholder="알림 시간 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">오전 6:00</SelectItem>
                        <SelectItem value="07:00">오전 7:00</SelectItem>
                        <SelectItem value="08:00">오전 8:00</SelectItem>
                        <SelectItem value="09:00">오전 9:00</SelectItem>
                        <SelectItem value="10:00">오전 10:00</SelectItem>
                        <SelectItem value="11:00">오전 11:00</SelectItem>
                        <SelectItem value="12:00">오후 12:00</SelectItem>
                        <SelectItem value="13:00">오후 1:00</SelectItem>
                        <SelectItem value="14:00">오후 2:00</SelectItem>
                        <SelectItem value="18:00">오후 6:00</SelectItem>
                        <SelectItem value="20:00">오후 8:00</SelectItem>
                        <SelectItem value="21:00">오후 9:00</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      선택한 시간에 오늘의 발견을 알림으로 받습니다
                    </p>
                  </div>
                )}
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
