import type { CarouselApi } from "@/components/ui/carousel"
import { useEffect } from "react"

const SCROLL_AMOUNT = 50

export function useCarouselKeyboard(api: CarouselApi | undefined) {
  useEffect(() => {
    if (!api) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에 포커스가 있으면 키보드 네비게이션 무시
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        api.scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        api.scrollNext()
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        // 현재 선택된 인덱스로 스크롤 컨테이너 찾기
        const selectedIndex = api.selectedScrollSnap()
        const allSlides = document.querySelectorAll('[role="group"][aria-roledescription="slide"]')
        const activeSlide = allSlides[selectedIndex] as HTMLElement
        
        if (activeSlide) {
          const scrollContainer = activeSlide.querySelector('.overflow-y-auto') as HTMLElement
          if (scrollContainer) {
            event.preventDefault()
            scrollContainer.scrollBy({
              top: event.key === 'ArrowUp' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
              behavior: 'smooth'
            })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [api])
}
