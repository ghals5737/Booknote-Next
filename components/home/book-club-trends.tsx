'use client';

import { Award, ChevronRight, Search, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface TrendingBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  recordCount: number;
}

interface BookClubTrendsProps {
  popularBooks?: TrendingBook[];
  trendingSearches?: string[];
  completedBooks?: { title: string; author: string; count: number }[];
}

export function BookClubTrends({
  popularBooks = [],
  trendingSearches = [],
  completedBooks = [],
}: BookClubTrendsProps) {
  // 목업 데이터 (실제로는 API에서 가져와야 함)
  const mockPopularBooks: TrendingBook[] = popularBooks.length > 0 ? popularBooks : [
    { id: 1, title: '1984', author: '조지 오웰', cover: '', recordCount: 342 },
    { id: 2, title: '호밀밭의 파수꾼', author: 'J.D. 샐린저', cover: '', recordCount: 287 },
    { id: 3, title: '위대한 개츠비', author: 'F. 스콧 피츠제럴드', cover: '', recordCount: 256 },
    { id: 4, title: '작은 아씨들', author: '루이자 메이 올컷', cover: '', recordCount: 213 },
    { id: 5, title: '안나 카레니나', author: '레프 톨스토이', cover: '', recordCount: 198 },
  ];

  const mockTrendingSearches: string[] = trendingSearches.length > 0 ? trendingSearches : [
    '조지 오웰',
    '디스토피아',
    '고전문학',
    '미국문학',
    '성장소설',
    '20세기 문학',
    '실존주의',
    '사회비판',
  ];

  const mockCompletedBooks = completedBooks.length > 0 ? completedBooks : [
    { title: '1984', author: '조지 오웰', count: 127 },
    { title: '위대한 개츠비', author: 'F. 스콧 피츠제럴드', count: 98 },
    { title: '호밀밭의 파수꾼', author: 'J.D. 샐린저', count: 86 },
  ];

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-[#B85C4F]" />
        <h2 className="text-2xl font-semibold text-[#2C2416]">
          북클럽 트렌드
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 이번 주 인기 도서 */}
        <div className="rounded-2xl bg-[#FFFEF9] p-6 shadow-sm border border-[rgba(184,92,79,0.15)] hover:shadow-md transition-shadow duration-200">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-[#F9F0EE] p-2">
              <TrendingUp className="h-5 w-5 text-[#B85C4F]" />
            </div>
            <h3 className="font-semibold text-[#2C2416]">이번 주 인기 도서</h3>
          </div>
          
          <div className="space-y-4">
            {mockPopularBooks.slice(0, 5).map((book, index) => (
              <div 
                key={book.id} 
                className="group flex items-start gap-3 cursor-pointer hover:bg-[#FAF8F5] p-2 -mx-2 rounded-lg transition-colors duration-150"
              >
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#F9F0EE] text-sm font-semibold text-[#B85C4F]">
                  {index + 1}
                </span>
                {book.cover ? (
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded shadow-sm">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-200">
                    <span className="text-xs text-gray-400">📚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-medium text-[#2C2416] line-clamp-1 mb-0.5 group-hover:text-[#B85C4F] transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-[#6B5D4F] mb-1 line-clamp-1">{book.author}</p>
                  <p className="text-xs text-[#B85C4F] font-medium">
                    {book.recordCount}명이 기록 중
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 급상승 검색어 */}
        <div className="rounded-2xl bg-[#FFFEF9] p-6 shadow-sm border border-[rgba(201,169,97,0.15)] hover:shadow-md transition-shadow duration-200">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-[#FAF6ED] p-2">
              <Search className="h-5 w-5 text-[#C9A961]" />
            </div>
            <h3 className="font-semibold text-[#2C2416]">급상승 검색어</h3>
          </div>
          
          <div className="space-y-3">
            {mockTrendingSearches.map((keyword, index) => (
              <div 
                key={index}
                className="group flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5] p-2 -mx-2 rounded-lg transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF6ED] text-sm font-semibold text-[#C9A961]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[#2C2416] group-hover:text-[#C9A961] transition-colors">
                    {keyword}
                  </span>
                </div>
                <TrendingUp className="h-4 w-4 text-[#C9A961] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[rgba(92,75,60,0.1)]">
            <p className="text-xs text-[#6B5D4F] text-center">
              이번 주 검색 증가율 기준
            </p>
          </div>
        </div>

        {/* 이달의 완독왕 */}
        <div className="rounded-2xl bg-[#FFFEF9] p-6 shadow-sm border border-[rgba(138,154,123,0.15)] hover:shadow-md transition-shadow duration-200">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-[#F3F5F1] p-2">
              <Award className="h-5 w-5 text-[#8A9A7B]" />
            </div>
            <h3 className="font-semibold text-[#2C2416]">이달의 완독왕</h3>
          </div>
          
          <div className="space-y-4">
            {mockCompletedBooks.map((book, index) => (
              <div 
                key={index}
                className="group cursor-pointer hover:bg-[#FAF8F5] p-3 -mx-3 rounded-lg transition-colors duration-150"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                    index === 0 ? 'bg-[#C9A961] text-white' : 
                    index === 1 ? 'bg-[#D4C5B0] text-[#2C2416]' : 
                    'bg-[#F3F5F1] text-[#8A9A7B]'
                  }`}>
                    {index === 0 ? '👑' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-medium text-[#2C2416] line-clamp-1 mb-0.5 group-hover:text-[#8A9A7B] transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#6B5D4F] line-clamp-1">{book.author}</p>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#F3F5F1] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#8A9A7B] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((book.count / mockCompletedBooks[0].count) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#8A9A7B] min-w-[3rem] text-right">
                      {book.count}명
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[rgba(92,75,60,0.1)]">
            <p className="text-xs text-[#6B5D4F] text-center">
              {new Date().getMonth() + 1}월 완독자 수 기준
            </p>
          </div>
        </div>
      </div>

      {/* 더보기 링크 */}
      <div className="mt-6 text-center">
        <button className="group inline-flex items-center gap-2 text-sm font-medium text-[#6B5D4F] hover:text-[#2C2416] transition-colors">
          <span>더 많은 트렌드 보기</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
