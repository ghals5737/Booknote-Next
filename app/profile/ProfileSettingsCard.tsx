"use client"


export function ProfileSettingsCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      <h2 className="mb-5 text-sm">설정</h2>
      <div className="space-y-0">
       
       
        <button className="w-full border-b border-border/30 py-3.5 text-left text-sm transition-colors hover:text-foreground">
          테마 변경
        </button>
        <button className="w-full py-3.5 text-left text-sm transition-colors hover:text-foreground">
          데이터 내보내기
        </button>
      </div>
    </div>
  )
}
