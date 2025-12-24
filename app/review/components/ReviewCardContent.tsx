import { Markdown } from "@/components/note/Markdown"
import { UIReviewItem } from "@/lib/types/review/review"
import { CARD_STYLES, QUOTE_MARK_CONFIG } from "../constants/review.constants"

interface ReviewCardContentProps {
  item: UIReviewItem
}

export function ReviewCardContent({ item }: ReviewCardContentProps) {
  // 인용문 길이에 따라 글자 크기를 동적으로 조절
  const contentLength = item.content?.length ?? 0

  // QUOTE 카드에서 한 화면에 너무 길게 나오지 않도록 미리보기 길이 제한
  const MAX_QUOTE_PREVIEW_LENGTH = 220
  const quotePreview =
    item.type === "QUOTE" && contentLength > MAX_QUOTE_PREVIEW_LENGTH
      ? `${item.content.slice(0, MAX_QUOTE_PREVIEW_LENGTH).trimEnd()}…`
      : item.content

  // 한글 인용문 길이에 맞게 비교적 낮은 기준으로 단계 조절
  let quoteTextSizeClass = "text-2xl md:text-3xl lg:text-4xl" // 짧은 문장
  if (contentLength > 220) {
    // 아주 긴 문장
    quoteTextSizeClass = "text-lg md:text-xl lg:text-2xl"
  } else if (contentLength > 120) {
    // 중간 이상 길이
    quoteTextSizeClass = "text-xl md:text-2xl lg:text-3xl"
  }

  return (
    <div className={`flex-1 min-h-0 overflow-hidden ${CARD_STYLES.padding.horizontal}`}>
      <div className="h-full overflow-y-auto">
        {item.type === "QUOTE" ? (
          <div className={`relative flex items-center justify-center h-full ${CARD_STYLES.padding.vertical}`}>
            {/* 큰 따옴표 디자인 요소 */}
            <div
              className={`pointer-events-none select-none absolute ${QUOTE_MARK_CONFIG.position.top} ${QUOTE_MARK_CONFIG.position.left} text-[#2D2D2D]`}
              style={{
                fontSize: QUOTE_MARK_CONFIG.fontSize,
                lineHeight: "1",
                fontFamily: "serif",
                opacity: QUOTE_MARK_CONFIG.opacity,
              }}
            >
              &ldquo;
            </div>
            <div
              className={`pointer-events-none select-none absolute ${QUOTE_MARK_CONFIG.position.bottom} ${QUOTE_MARK_CONFIG.position.right} text-[#2D2D2D]`}
              style={{
                fontSize: QUOTE_MARK_CONFIG.fontSize,
                lineHeight: "1",
                fontFamily: "serif",
                opacity: QUOTE_MARK_CONFIG.opacity,
              }}
            >
              &rdquo;
            </div>
            <p className={`text-center leading-relaxed px-12 md:px-16 lg:px-20 ${quoteTextSizeClass} font-serif text-[#2D2D2D] relative z-10`}>
              {quotePreview}
            </p>
          </div>
        ) : (
          <div className="w-full py-4">
            <Markdown content={item.content} />
          </div>
        )}
      </div>
    </div>
  )
}
