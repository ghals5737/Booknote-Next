import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BookOpen } from "lucide-react"

interface ReviewStartCardProps {
  onStart: () => void
  totalCount: number
}

export function ReviewStartCard({ onStart, totalCount }: ReviewStartCardProps) {
  return (
    <Card className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            오늘의 복습
          </h2>
          <p className="text-muted-foreground text-lg">
            총 <span className="font-semibold text-foreground">{totalCount}</span>개의 카드가 기다리고 있어요
          </p>
        </div>

        <p className="text-sm text-muted-foreground max-w-md">
          중요한 노트들을 정기적으로 복습하면 기억에 오래 남아요
        </p>

        <Button
          size="lg"
          onClick={onStart}
          className="mt-4 px-8 py-6 text-lg"
        >
          복습 시작하기
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* 키보드 단축키 안내 */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">키보드 단축키</p>
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                ←
              </kbd>
              <span>/</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                →
              </kbd>
              <span className="ml-1">이전/다음 카드</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                Space
              </kbd>
              <span className="ml-1">내용 보기</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

