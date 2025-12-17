"use client"

import { authenticatedApiRequest } from "@/lib/api/nextauth-api"
import { ArrowLeft, BookOpen, Calendar, FileText, Quote } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { ProfileLogoutCard } from "./ProfileLogoutCard"
import { ProfileSettingsCard } from "./ProfileSettingsCard"
import { ProfileStatsGrid } from "./ProfileStatsGrid"
import { ReminderSettingsCard } from "./ReminderSettingsCard"

interface NotificationTime {
  hour: number
  minute: number
  second: number
  nano: number
}

interface NotificationSettings {
  id: number
  enabledYn: string
  notificationTime: NotificationTime | string
}

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

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "독서 애호가",
    email: "reader@booknote.com",
    bio: "책을 사랑하는 사람입니다.",
  })
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState("08:00")

  // 알림 설정 조회
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await authenticatedApiRequest<NotificationSettings>("/api/v1/users/notification")
        const data = response.data

        const enabled = data.enabledYn === "Y"
        
        // notificationTime이 문자열인 경우 파싱
        let hour = 8
        let minute = 0
        
        if (typeof data.notificationTime === "string") {
          // "14:00:00" 형식의 문자열 파싱
          const [h, m] = data.notificationTime.split(":").map(Number)
          hour = h ?? 8
          minute = m ?? 0
        } else if (data.notificationTime) {
          // 객체인 경우 (하위 호환성)
          hour = data.notificationTime.hour ?? 8
          minute = data.notificationTime.minute ?? 0
        }

        const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        setReminderEnabled(enabled)
        setReminderTime(formattedTime)
      } catch (error) {
        console.error("[ProfilePage] 알림 설정 조회 실패:", error)
      }
    }

    fetchNotificationSettings()
  }, [])

  const updateNotificationSettings = async (enabled: boolean, time: string) => {
    try {
      const [hourStr] = time.split(":")
      const hour = parseInt(hourStr, 10)

      await authenticatedApiRequest("/api/v1/users/notification", {
        method: "PATCH",
        body: JSON.stringify({
          enabledYn: enabled ? "Y" : "N",
          notificationTime: hour,
        }),
      })
    } catch (error) {
      console.error("[ProfilePage] 알림 설정 업데이트 실패:", error)
    }
  }

  const handleEnabledChange = async (value: boolean) => {
    setReminderEnabled(value)
    await updateNotificationSettings(value, reminderTime)
  }

  const handleTimeChange = async (value: string) => {
    setReminderTime(value)
    await updateNotificationSettings(reminderEnabled, value)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          내 서재로 돌아가기
        </Link>

        <div className="space-y-6">
          <ProfileHeaderCard value={profile} onChange={setProfile} />
          <ProfileStatsGrid stats={stats} />
          <ProfileSettingsCard />
          <ReminderSettingsCard
            enabled={reminderEnabled}
            time={reminderTime}
            onEnabledChange={handleEnabledChange}
            onTimeChange={handleTimeChange}
          />
          <ProfileLogoutCard />
        </div>
      </div>
    </div>
  )
}
