"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Share2, Sparkles } from "lucide-react"
import { useState } from "react"

// Mock 데이터 - 랜덤한 책 인용구들
const mockQuotes = [
  {
    quote: "삶은 속도가 아니라 방향이다. 중요한 것은 얼마나 빨리 가는가가 아니라 어디로 가는가이다.",
    bookTitle: "데미안",
    author: "헤르만 헤세",
    emoji: "📖"
  },
  {
    quote: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라 넘어질 때마다 일어서는 것이다.",
    bookTitle: "넬슨 만델라 자서전",
    author: "넬슨 만델라",
    emoji: "🌟"
  },
  {
    quote: "성공은 준비된 자에게 찾아오는 기회다.",
    bookTitle: "아인슈타인",
    author: "월터 아이작슨",
    emoji: "💡"
  },
  {
    quote: "과거를 바꿀 수는 없지만, 미래는 바꿀 수 있다.",
    bookTitle: "7가지 습관",
    author: "스티븐 코비",
    emoji: "✨"
  },
  {
    quote: "독서는 정신의 양식이다.",
    bookTitle: "책의 힘",
    author: "미상",
    emoji: "📚"
  }
]

export function DailyDiscoveryCard() {
  // 오늘 날짜를 기반으로 랜덤 인용구 선택 (날짜별로 고정)
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const selectedQuote = mockQuotes[dayOfYear % mockQuotes.length]
  const [isShared, setIsShared] = useState(false)

  const handleShare = () => {
    setIsShared(true)
    // 실제로는 공유 기능 구현
    setTimeout(() => setIsShared(false), 2000)
  }

  const handleViewDetail = () => {
    // 실제로는 책 상세 페이지로 이동
    console.log("책 상세 페이지로 이동:", selectedQuote.bookTitle)
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 border-primary/20 my-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 상단: 뱃지 */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              오늘의 발견
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className={`h-4 w-4 ${isShared ? "text-primary" : ""}`} />
            </Button>
          </div>

          {/* 중단: 인용구 */}
          <div className="space-y-3">
            <p className="text-lg leading-relaxed text-foreground italic">
              "{selectedQuote.quote}"
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedQuote.emoji}</span>
              <span className="font-medium">{selectedQuote.bookTitle}</span>
              <span>·</span>
              <span>{selectedQuote.author}</span>
            </div>
          </div>

          {/* 하단: 버튼 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetail}
              className="flex-1"
            >
              자세히 보기
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

