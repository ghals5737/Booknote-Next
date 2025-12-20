import { Progress } from "@/components/ui/progress"

interface ReviewProgressBarProps {
  completedCount: number
  totalCount: number
}

export function ReviewProgressBar({ completedCount, totalCount }: ReviewProgressBarProps) {
  const progressValue = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">진행률</span>
        <span className="font-semibold">
          {completedCount} / {totalCount}
        </span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  )
}
