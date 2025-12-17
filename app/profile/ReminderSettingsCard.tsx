"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"

interface ReminderSettingsCardProps {
  enabled: boolean
  time: string
  onEnabledChange: (value: boolean) => void
  onTimeChange: (value: string) => void
}

export function ReminderSettingsCard({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: ReminderSettingsCardProps) {
  return (
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
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          </div>

          {/* 알림 시간 선택 */}
          {enabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="text-base font-medium">
                알림 시간
              </Label>
              <Select value={time} onValueChange={onTimeChange}>
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
  )
}
