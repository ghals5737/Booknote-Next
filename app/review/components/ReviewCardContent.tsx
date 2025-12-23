import { Markdown } from "@/components/note/Markdown"
import { UIReviewItem } from "@/lib/types/review/review"
import { CARD_STYLES, QUOTE_MARK_CONFIG } from "../constants/review.constants"

interface ReviewCardContentProps {
  item: UIReviewItem
}

export function ReviewCardContent({ item }: ReviewCardContentProps) {
  return (
    <div className={`flex-1 min-h-0 overflow-hidden ${CARD_STYLES.padding.horizontal}`}>
      <div className="h-full overflow-y-auto">
        {item.type === "QUOTE" ? (
          <div className={`relative flex items-center justify-center h-full ${CARD_STYLES.padding.vertical}`}>
            {/* 큰 따옴표 디자인 요소 */}
            <div
              className={`absolute ${QUOTE_MARK_CONFIG.position.top} ${QUOTE_MARK_CONFIG.position.left} text-[#2D2D2D]`}
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
              className={`absolute ${QUOTE_MARK_CONFIG.position.bottom} ${QUOTE_MARK_CONFIG.position.right} text-[#2D2D2D]`}
              style={{
                fontSize: QUOTE_MARK_CONFIG.fontSize,
                lineHeight: "1",
                fontFamily: "serif",
                opacity: QUOTE_MARK_CONFIG.opacity,
              }}
            >
              &rdquo;
            </div>
            <p className="text-center leading-relaxed px-8 text-3xl md:text-4xl lg:text-5xl font-serif text-[#2D2D2D] relative z-10">
              {item.content}
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
