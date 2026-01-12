'use client';

import { FileText, Quote } from 'lucide-react';
import Link from 'next/link';

type RecordType = 'quote' | 'note';

const recordTypes = [
  { 
    id: 'quote' as RecordType, 
    label: '인용구 쓰기', 
    icon: Quote,
    color: 'bg-[#FAF6ED] text-[#C9A961] border-[#C9A961]/30', 
    hoverColor: 'hover:bg-[#FAF6ED] hover:border-[#C9A961]/50',
    iconColor: 'text-[#C9A961]',
    placeholder: '마음에 드는 문장을 그대로 적어보세요',
    description: '책에서 인상 깊은 문장',
    href: '/book/add?type=quote'
  },
  { 
    id: 'note' as RecordType, 
    label: '노트 쓰기', 
    icon: FileText,
    color: 'bg-[#F3F5F1] text-[#8A9A7B] border-[#8A9A7B]/30', 
    hoverColor: 'hover:bg-[#F3F5F1] hover:border-[#8A9A7B]/50',
    iconColor: 'text-[#8A9A7B]',
    placeholder: '읽으면서 든 생각을 자유롭게 적어보세요',
    description: '나의 생각과 느낌 기록',
    href: '/book/add?type=note'
  },
];

export function ActionTabs() {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-3">
        {recordTypes.map((type) => {
          const Icon = type.icon;
          
          return (
            <Link
              key={type.id}
              href={type.href}
              className={`
                flex flex-col items-center justify-center gap-2 px-5 py-5 rounded-xl
                border-2 transition-all duration-200
                bg-card/40 text-muted-foreground border-border/30 ${type.hoverColor} hover:shadow-sm
              `}
            >
              <Icon className={`h-6 w-6 flex-shrink-0 ${type.iconColor}`} />
              <div className="text-center">
                <div className="text-base font-medium">{type.label}</div>
                <div className="text-xs mt-0.5 opacity-60">
                  {type.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
