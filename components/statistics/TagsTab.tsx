"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hash } from "lucide-react"

// 자주 사용하는 태그 목록 (실제로는 API에서 가져와야 함)
const COMMON_TAGS = [
  { name: "중요", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { name: "복습", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "질문", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { name: "인용", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { name: "아이디어", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
]

// 태그별 통계 (실제로는 API에서 가져와야 함)
const TAG_STATS = [
  { name: "중요", count: 25 },
  { name: "복습", count: 18 },
  { name: "질문", count: 15 },
  { name: "인용", count: 12 },
  { name: "아이디어", count: 10 },
]

export function TagsTab() {
  const maxCount = Math.max(...TAG_STATS.map(tag => tag.count), 1);

  return (
    <div className="space-y-6">
      {/* 자주 사용하는 태그 */}
      <Card>
        <CardHeader>
          <CardTitle>자주 사용하는 태그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className={`${tag.color} px-4 py-2 text-sm font-medium`}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 태그별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>태그별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TAG_STATS.map((tag, index) => {
              const percentage = (tag.count / maxCount) * 100;
              return (
                <div key={tag.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">#{tag.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{tag.count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

