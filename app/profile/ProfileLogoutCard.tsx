"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut } from "lucide-react"

export function ProfileLogoutCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <Button variant="destructive" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </CardContent>
    </Card>
  )
}
