import { Markdown } from "@/components/note/Markdown"
import { UIReviewItem } from "@/lib/types/review/review"

interface ReviewCardContentProps {
  item: UIReviewItem
}

export function ReviewCardContent({ item }: ReviewCardContentProps) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden px-4">
      <div className="h-full overflow-y-auto">
        {item.type === "QUOTE" ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center leading-relaxed px-2 text-2xl md:text-3xl lg:text-4xl italic text-foreground">
              "{item.content}"
            </p>
          </div>
        ) : (
          <div className="w-full">
            <Markdown content={item.content} />
          </div>
        )}
      </div>
    </div>
  )
}
