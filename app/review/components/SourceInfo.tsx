interface SourceInfoProps {
  source: string
  page?: number
  date: string
}

export function SourceInfo({ source, page, date }: SourceInfoProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-1.5">
      <div className="text-base md:text-lg font-semibold text-[#2D2D2D]">
        {source}
      </div>
      <div className="flex items-center gap-2.5 text-sm text-[#888]">
        {page && page > 0 && (
          <>
            <span>{page}p</span>
            <span>·</span>
          </>
        )}
        <span>{date}</span>
      </div>
    </div>
  )
}

