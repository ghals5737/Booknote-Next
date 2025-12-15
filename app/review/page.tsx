"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Check, ExternalLink, FileText, Quote, AlertCircle, Calendar, CheckCircle, Clock, Eye, StickyNote, X, LayoutGrid, LayoutList } from "lucide-react"
import Link from "next/link"

type ReviewItemType = "NOTE" | "QUOTE"

interface ReviewItem {
  id: number
  type: ReviewItemType
  content: string
  source: string
  page?: number
  date: string
  tags: string[]
  title?: string
  dueDate?: string
  frequency?: string
  status?: "overdue" | "pending" | "completed"
}

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: 1,
    type: "QUOTE",
    content: "삶은 속도가 아니라 방향이다. 중요한 것은 얼마나 빨리 가는가가 아니라 어디로 가는가이다.",
    source: "데미안",
    page: 124,
    date: "2024.01.15",
    tags: ["인생", "철학"],
    title: "삶의 방향",
    dueDate: "2024-01-15",
    frequency: "3번째 복습",
    status: "overdue",
  },
  {
    id: 2,
    type: "NOTE",
    content: "습관 형성의 4단계: 신호(Cue) → 갈망(Craving) → 반응(Response) → 보상(Reward). 이 사이클을 이해하면 새로운 습관을 만들고 나쁜 습관을 끊을 수 있다.",
    source: "아토믹 해빗",
    page: 45,
    date: "2024.01.12",
    tags: ["습관", "자기계발"],
    title: "습관 형성의 4단계",
    dueDate: "2024-01-15",
    frequency: "1번째 복습",
    status: "overdue",
  },
  {
    id: 3,
    type: "QUOTE",
    content: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라 넘어질 때마다 일어서는 것이다.",
    source: "넬슨 만델라 자서전",
    page: 89,
    date: "2024.01.10",
    tags: ["동기부여", "인생"],
    title: "넘어져도 일어서기",
    dueDate: "2024-01-14",
    frequency: "5번째 복습",
    status: "overdue",
  },
  {
    id: 4,
    type: "NOTE",
    content: "성장 마인드셋과 고정 마인드셋의 차이: 성장 마인드셋을 가진 사람은 실패를 학습의 기회로 본다. 반면 고정 마인드셋을 가진 사람은 실패를 자신의 한계로 인식한다.",
    source: "마인드셋",
    page: 67,
    date: "2024.01.08",
    tags: ["성장", "심리학"],
    title: "성장 마인드셋의 중요성",
    dueDate: "2024-01-15",
    frequency: "3번째 복습",
    status: "overdue",
  },
  {
    id: 5,
    type: "QUOTE",
    content: "과거를 바꿀 수는 없지만, 미래는 바꿀 수 있다.",
    source: "7가지 습관",
    page: 156,
    date: "2024.01.05",
    tags: ["변화", "자기계발"],
    title: "미래의 변화",
    dueDate: "2024-01-15",
    frequency: "1번째 복습",
    status: "overdue",
  },
  {
    id: 6,
    type: "NOTE",
    content: "몰입(Flow) 상태에 들어가기 위한 조건: 명확한 목표, 즉각적인 피드백, 도전과 능력의 균형. 이 세 가지가 갖춰지면 시간이 멈춘 것처럼 느껴지는 최적의 경험을 할 수 있다.",
    source: "플로우",
    page: 112,
    date: "2024.01.03",
    tags: ["몰입", "성과"],
    title: "몰입의 조건들",
    dueDate: "2024-01-14",
    frequency: "5번째 복습",
    status: "overdue",
  },
  {
    id: 7,
    type: "QUOTE",
    content: "독서는 정신의 양식이다. 하루에 한 시간씩만 투자해도 일년에 365시간, 평생에 수천 권의 책을 읽을 수 있다.",
    source: "책의 힘",
    page: 23,
    date: "2024.01.01",
    tags: ["독서", "학습"],
    title: "독서의 힘",
    dueDate: "2024-01-15",
    frequency: "1번째 복습",
    status: "pending",
  },
  {
    id: 8,
    type: "NOTE",
    content: "의사결정 피로를 줄이는 방법: 중요한 결정은 아침에 하고, 작은 결정들은 루틴화하거나 미리 정해두자. 스티브 잡스는 매일 같은 옷을 입어 의사결정 에너지를 절약했다.",
    source: "결정의 기술",
    page: 78,
    date: "2023.12.28",
    tags: ["생산성", "의사결정"],
    title: "의사결정 피로",
    dueDate: "2024-01-15",
    frequency: "1번째 복습",
    status: "completed",
  },
]

const reviewStats = [
  { icon: Calendar, label: "오늘 복습", count: 0, color: "bg-blue-100 text-blue-600" },
  { icon: AlertCircle, label: "밀린 복습", count: 5, color: "bg-red-100 text-red-600" },
  { icon: CheckCircle, label: "완료된 복습", count: 1, color: "bg-green-100 text-green-600" },
  { icon: StickyNote, label: "전체 노트", count: REVIEW_ITEMS.length, color: "bg-purple-100 text-purple-600" },
]

export default function ReviewPage() {
  const [mode, setMode] = useState<"carousel" | "list">("carousel")
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState("전체")

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const handleComplete = useCallback(() => {
    // 복습 완료 처리 (향후 API 연동)
    console.log("복습 완료:", REVIEW_ITEMS[current - 1])
  }, [current])

  const progressValue = count > 0 ? (current / count) * 100 : 0

  // 탭별 필터링
  const filteredItems = REVIEW_ITEMS.filter((item) => {
    if (activeTab === "오늘") {
      return item.status === "pending"
    } else if (activeTab === "밀린 복습") {
      return item.status === "overdue"
    } else if (activeTab === "완료") {
      return item.status === "completed"
    }
    return true
  })

  const tabs = [
    `전체 (${REVIEW_ITEMS.length})`,
    `오늘 (${REVIEW_ITEMS.filter((i) => i.status === "pending").length})`,
    `밀린 복습 (${REVIEW_ITEMS.filter((i) => i.status === "overdue").length})`,
    `완료 (${REVIEW_ITEMS.filter((i) => i.status === "completed").length})`,
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">복습 관리</h1>
            <p className="text-muted-foreground">
              {mode === "carousel"
                ? `총 ${REVIEW_ITEMS.length}개의 카드가 기다리고 있어요.`
                : "중요한 노트들을 정기적으로 복습하세요"}
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "carousel" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("carousel")}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              집중 모드
            </Button>
            <Button
              variant={mode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("list")}
              className="flex items-center gap-2"
            >
              <LayoutList className="h-4 w-4" />
              리스트 모드
            </Button>
          </div>
        </div>

        {/* Carousel Mode */}
        {mode === "carousel" && (
          <>
            {/* Progress Bar */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">진행률</span>
                <span className="font-semibold">
                  {current} / {count}
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            {/* Review Carousel */}
            <div className="relative">
              <Carousel setApi={setApi} className="w-full" opts={{ align: "start", loop: false }}>
                <CarouselContent className="-ml-2 md:-ml-4">
                  {REVIEW_ITEMS.map((item) => (
                    <CarouselItem key={item.id} className="pl-2 md:pl-4">
                      <Card className="h-[400px] md:h-[500px] flex flex-col">
                        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
                          {/* Type Badge */}
                          <div className="mb-6">
                            {item.type === "NOTE" ? (
                              <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                                <FileText className="h-3 w-3" />
                                노트
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                                <Quote className="h-3 w-3" />
                                인용구
                              </Badge>
                            )}
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 flex items-center justify-center w-full">
                            <p
                              className={`text-center leading-relaxed px-2 ${
                                item.type === "QUOTE"
                                  ? "text-xl md:text-2xl lg:text-3xl italic text-foreground"
                                  : "text-base md:text-lg lg:text-xl text-foreground"
                              }`}
                            >
                              {item.type === "QUOTE" ? `"${item.content}"` : item.content}
                            </p>
                          </div>
                        </CardContent>

                        {/* Footer */}
                        <CardFooter className="flex flex-col gap-3 p-6 pt-0 border-t">
                          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{item.source}</span>
                              {item.page && (
                                <>
                                  <span>·</span>
                                  <span>{item.page}p</span>
                                </>
                              )}
                              <span>·</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 w-full">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              asChild
                            >
                              <Link href={`/book/${item.id}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                자세히 보기
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={handleComplete}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              완료
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Navigation Arrows */}
                <CarouselPrevious className="hidden md:flex -left-12" />
                <CarouselNext className="hidden md:flex -right-12" />
              </Carousel>
            </div>
          </>
        )}

        {/* List Mode */}
        {mode === "list" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {reviewStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3"
                >
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{stat.count}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.split(" ")[0])}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.split(" ")[0]
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Review Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{item.title || item.content.substring(0, 30)}</h3>
                        {item.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === "overdue" ? "bg-red-100 text-red-700" :
                            item.status === "completed" ? "bg-green-100 text-green-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{item.source}</div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {item.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>다음 복습: {item.dueDate}</span>
                          </div>
                        )}
                        {item.frequency && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.frequency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600">
                        <X className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-yellow-600">
                        <Clock className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-600">
                        <Check className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
