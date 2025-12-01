"use client";

import { Search } from "lucide-react";
import { useState } from "react";

type SearchModalProps = {
  onClose: () => void;
};

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 검색 인풋 영역 */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/60">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="책 / 노트 / 인용구를 한 번에 검색해보세요"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <span className="hidden sm:inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ⌘K
          </span>
        </div>

        {/* 본문: 결과 영역 틀 */}
        <div className="max-h-[24rem] overflow-y-auto px-4 py-3 space-y-4">
          {!query && (
            <div className="text-xs text-muted-foreground">
              검색어를 입력하면 내 책, 노트, 인용구를 한 번에 보여줄게요.
              <br />
              (지금은 목업 상태입니다. 다음 단계에서 실제 결과 리스트를 만들어요.)
            </div>
          )}

          {query && (
            <div className="space-y-3">
              <Section title="책" />
              <Section title="노트" />
              <Section title="인용구" />
            </div>
          )}
        </div>

        {/* 푸터 안내 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/40">
          <p className="text-[11px] text-muted-foreground">
            ↑↓ 로 이동 · Enter로 열기 · Esc 로 닫기
          </p>
          {query && (
            <button
              type="button"
              className="text-[11px] text-primary hover:underline"
            >
              ‘{query}’ 전체 결과 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 섹션 타이틀만 있는 아주 얇은 컴포넌트 (다음 단계에서 아이템을 채울 예정) */
function Section({ title }: { title: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium text-muted-foreground">
        {title}
      </div>
      <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
        {title} 결과 영역 (다음 단계에서 실제 아이템을 넣을게요)
      </div>
    </div>
  );
}