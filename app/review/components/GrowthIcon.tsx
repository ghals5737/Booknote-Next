"use client"

interface GrowthIconProps {
  reviewCount?: number
  className?: string
}

export function GrowthIcon({ reviewCount = 0, className = "" }: GrowthIconProps) {
  // reviewCount를 기준으로 진행률 계산 (최대 5회 복습 기준)
  const progress = Math.min(reviewCount / 5, 1) // 0~1 범위로 정규화

  // 진행률에 따라 아이콘 결정
  let icon: string
  let label: string

  if (progress < 0.4) {
    // 0~40%: 씨앗
    icon = "🌰"
    label = "씨앗"
  } else if (progress < 0.8) {
    // 40~80%: 새싹
    icon = "🌱"
    label = "새싹"
  } else {
    // 80%+: 나무
    icon = "🌳"
    label = "나무"
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-[#888]">{label}</span>
    </div>
  )
}

