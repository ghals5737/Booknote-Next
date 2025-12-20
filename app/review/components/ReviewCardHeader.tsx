import { Badge } from "@/components/ui/badge"
import { FileText, Quote } from "lucide-react"

interface ReviewCardHeaderProps {
  type: "NOTE" | "QUOTE"
}

export function ReviewCardHeader({ type }: ReviewCardHeaderProps) {
  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-2">
      {type === "NOTE" ? (
        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit text-xs">
          <FileText className="h-3 w-3" />
          노트
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit text-xs">
          <Quote className="h-3 w-3" />
          인용구
        </Badge>
      )}
    </div>
  )
}
