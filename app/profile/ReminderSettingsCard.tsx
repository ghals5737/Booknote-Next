"use client"

import { useState } from "react"

interface ReminderSettingsCardProps {
  enabled: boolean
  time: string
  onEnabledChange: (value: boolean) => void
  onTimeChange: (value: string) => void
}

const timeOptions = [
  { value: "06:00", label: "오전 6:00" },
  { value: "07:00", label: "오전 7:00" },
  { value: "08:00", label: "오전 8:00" },
  { value: "09:00", label: "오전 9:00" },
  { value: "10:00", label: "오전 10:00" },
  { value: "11:00", label: "오전 11:00" },
  { value: "12:00", label: "오후 12:00" },
  { value: "13:00", label: "오후 1:00" },
  { value: "14:00", label: "오후 2:00" },
  { value: "18:00", label: "오후 6:00" },
  { value: "20:00", label: "오후 8:00" },
  { value: "21:00", label: "오후 9:00" },
]

export function ReminderSettingsCard({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
}: ReminderSettingsCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTime = timeOptions.find(opt => opt.value === time)

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <h2 className="mb-5 text-sm">리마인더 설정</h2>
      
      <div className="space-y-5">
        {/* 매일 알림 받기 */}
        <div className="flex items-start justify-between border-b border-border/30 pb-5">
          <div className="space-y-1">
            <p className="text-sm">매일 알림 받기</p>
            <p className="text-xs text-muted-foreground/60">
              매일 오늘의 발견을 알림으로 받아보세요
            </p>
          </div>
          <button
            onClick={() => onEnabledChange(!enabled)}
            className={`
              relative h-6 w-11 shrink-0 rounded-full transition-colors
              ${enabled ? 'bg-foreground' : 'bg-border/50'}
            `}
            role="switch"
            aria-checked={enabled}
          >
            <span
              className={`
                absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform
                ${enabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* 알림 시간 */}
        {enabled && (
          <div className="space-y-2.5">
            <p className="text-sm">알림 시간</p>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3.5 py-2.5 text-sm transition-all hover:border-border hover:bg-background"
              >
                <span>{selectedTime?.label || "시간 선택"}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isOpen && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border/50 bg-card shadow-lg">
                  <div className="max-h-60 overflow-y-auto">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onTimeChange(option.value)
                          setIsOpen(false)
                        }}
                        className={`
                          w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-secondary/50
                          ${time === option.value ? 'bg-secondary/30' : ''}
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground/60">
              선택한 시간에 알림을 발송드립니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
