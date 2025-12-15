// 검색어 하이라이팅 유틸리티

import React from "react";

/**
 * 텍스트에서 검색어를 찾아서 노란색 형광팬처럼 하이라이팅
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이팅된 React 요소
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  // 검색어를 정규식으로 이스케이프 (특수문자 처리)
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  // split()을 사용하면 캡처 그룹이 포함되어 매칭된 부분과 매칭되지 않은 부분이 번갈아 나타남
  // 홀수 인덱스(1, 3, 5...)가 매칭된 부분
  return parts.map((part, index) => {
    // 홀수 인덱스는 매칭된 부분 (하이라이팅)
    if (index % 2 === 1) {
      return (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground rounded px-0.5"
        >
          {part}
        </mark>
      );
    }
    // 짝수 인덱스는 매칭되지 않은 부분
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

