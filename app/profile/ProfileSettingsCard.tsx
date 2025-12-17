"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileSettingsCard() {
  return (
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
  )
}
