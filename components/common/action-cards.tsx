import { Card } from "@/components/ui/card"
import { BarChart3, Plus, RotateCcw, Search } from "lucide-react"

const actions = [
  {
    icon: Plus,
    label: "책 추가",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Search,
    label: "검색",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: RotateCcw,
    label: "복습",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: BarChart3,
    label: "통계",
    color: "bg-orange-100 text-orange-600",
  },
]

export function ActionCards() {
  return (
    <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 p-6 transition-all hover:shadow-md"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${action.color}`}>
            <action.icon className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </Card>
      ))}
    </div>
  )
}
