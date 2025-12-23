import { Badge } from "@/components/ui/badge"

interface TagListProps {
  tags: string[]
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant="outline"
          className="text-xs py-0.5 border-[#2D2D2D]/20 text-[#2D2D2D]/70 bg-transparent"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}

