import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UIReviewItem } from "@/lib/types/review/review"
import { Check, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ReviewCardFooterProps {
  item: UIReviewItem
  isLoading: boolean
  onComplete: (itemId: number) => void
}

export function ReviewCardFooter({ item, isLoading, onComplete }: ReviewCardFooterProps) {
  return (
    <div className="flex-shrink-0 flex flex-col gap-2 px-4 pb-3 pt-2 border-t">
      {/* Source and Date */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
        <span className="font-medium">{item.source}</span>
        {item.page && item.page > 0 && (
          <>
            <span>·</span>
            <span>{item.page}p</span>
          </>
        )}
        <span>·</span>
        <span>{item.date}</span>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 -mt-1">
          {item.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs py-0.5">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {item.bookId ? (
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
            <Link href={`/book/${item.bookId}`}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              자세히 보기
            </Link>
          </Button>
        ) : null}
        <Button 
          size="sm" 
          className={`h-8 text-xs ${item.bookId ? "flex-1" : "w-full"}`}
          onClick={(e) => {
            e.preventDefault()
            onComplete(item.id)
          }}
          disabled={isLoading || item.status === "completed"}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {isLoading ? "처리 중..." : item.status === "completed" ? "완료됨" : "완료"}
        </Button>
      </div>
    </div>
  )
}
