"use client"

import { ArrowLeft, BookOpen, Calendar, FileText, Quote } from "lucide-react"
import { getSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { ProfileLogoutCard } from "./ProfileLogoutCard"
import { ProfileSettingsCard } from "./ProfileSettingsCard"
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

type ProfileData = {
  name: string
  email: string
  bio: string
  nickname: string
  profileImgUrl: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    nickname: "",
    profileImgUrl: "",
  })
  const [stats, setStats] = useState([
    {
      icon: BookOpen,
      label: "읽은 책",
      value: 0,
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FileText,
      label: "작성한 노트",
      value: 0,
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Quote,
      label: "저장한 인용구",
      value: 0,
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Calendar,
      label: "연속 독서",
      value: "0일",
      color: "bg-orange-100 text-orange-600",
    },
  ])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState("08:00")

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true)
        
        const session = await getSession()
        if (!session?.accessToken) {
          console.error("[ProfilePage] 인증 토큰이 없습니다.")
          return
        }

        const response = await fetch("/api/v1/users/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`프로필 조회 실패: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          throw new Error("서버가 JSON이 아닌 응답을 반환했습니다.")
        }

        const result = await response.json()
        const { user, stats: profileStats } = result.data
        
        // 프로필 정보 설정
        setProfile({
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          nickname: user.nickname || "",
          profileImgUrl: user.profileImage || "",
        })
        
        // 통계 정보 설정
        setStats([
          {
            icon: BookOpen,
            label: "읽은 책",
            value: profileStats.totalBooks,
            color: "bg-blue-100 text-blue-600",
          },
          {
            icon: FileText,
            label: "작성한 노트",
            value: profileStats.totalNotes,
            color: "bg-green-100 text-green-600",
          },
          {
            icon: Quote,
            label: "저장한 인용구",
            value: profileStats.totalQuotes,
            color: "bg-purple-100 text-purple-600",
          },
          {
            icon: Calendar,
            label: "연속 독서",
            value: `${profileStats.readingStreak}일`,
            color: "bg-orange-100 text-orange-600",
          },
        ])
      } catch (error) {
        console.error("[ProfilePage] 프로필 조회 실패:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  // 알림 설정 조회
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const session = await getSession()
        if (!session?.accessToken) {
          console.error("[ProfilePage] 인증 토큰이 없습니다.")
          return
        }

        const response = await fetch("/api/v1/users/notification", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`알림 설정 조회 실패: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          throw new Error("서버가 JSON이 아닌 응답을 반환했습니다.")
        }

        const result = await response.json()
        const data = result.data as NotificationSettings

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
      const session = await getSession()
      if (!session?.accessToken) {
        console.error("[ProfilePage] 인증 토큰이 없습니다.")
        return
      }

      const [hourStr] = time.split(":")
      const hour = parseInt(hourStr, 10)

      const response = await fetch("/api/v1/users/notification", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          enabledYn: enabled ? "Y" : "N",
          notificationTime: hour,
        }),
      })

      if (!response.ok) {
        throw new Error(`알림 설정 업데이트 실패: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("서버가 JSON이 아닌 응답을 반환했습니다.")
      }

      await response.json()
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
          {isLoadingProfile ? (
            <div className="flex items-center justify-center p-6">
              <p className="text-muted-foreground">프로필 정보를 불러오는 중...</p>
            </div>
          ) : (
            <ProfileHeaderCard 
              value={profile} 
              onChange={setProfile}
              onUpdate={() => {
                // 프로필 업데이트 후 필요시 추가 작업 수행
              }}
            />
          )}
         
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
