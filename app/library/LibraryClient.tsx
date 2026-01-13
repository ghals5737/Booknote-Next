'use client';

import { LibraryHeader } from '@/components/library/library-header';
import { LibrarySearch } from '@/components/library/library-search';
import { LibraryTabs } from '@/components/library/library-tabs';
import { LibraryFolders } from '@/components/library/library-folders';
import { LibraryBooksGrid } from '@/components/library/library-books-grid';
import { SearchModal } from '@/components/layout/SearchModal';
import { UserBookResponsePage, BOOK_CATEGORY_LABELS } from '@/lib/types/book/book';
import { useMemo, useState } from 'react';

interface LibraryClientProps {
  booksData: UserBookResponsePage;
}

export function LibraryClient({ booksData }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('전체');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const books = booksData.content || [];
  const totalCount = booksData.totalElements || 0;

  // 카테고리별 책 개수 계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 전체: books.length };
    
    books.forEach((book) => {
      if (book.category) {
        const categoryLabel = BOOK_CATEGORY_LABELS[book.category as keyof typeof BOOK_CATEGORY_LABELS] || book.category;
        counts[categoryLabel] = (counts[categoryLabel] || 0) + 1;
      }
    });
    
    return counts;
  }, [books]);

  // 탭 목록 생성
  const tabs = useMemo(() => {
    const tabList = [{ id: '전체', label: '전체' }];
    
    // 카테고리별 탭 추가
    Object.keys(BOOK_CATEGORY_LABELS).forEach((key) => {
      const label = BOOK_CATEGORY_LABELS[key as keyof typeof BOOK_CATEGORY_LABELS];
      if (categoryCounts[label] > 0) {
        tabList.push({ id: label, label });
      }
    });
    
    return tabList;
  }, [categoryCounts]);

  // 필터링된 책 목록
  const filteredBooks = useMemo(() => {
    let filtered = books;

    // 탭 필터
    if (activeTab !== '전체') {
      const categoryKey = Object.keys(BOOK_CATEGORY_LABELS).find(
        (key) => BOOK_CATEGORY_LABELS[key as keyof typeof BOOK_CATEGORY_LABELS] === activeTab
      );
      if (categoryKey) {
        filtered = filtered.filter((book) => book.category === categoryKey);
      }
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [books, activeTab, searchQuery]);

  // 폴더 데이터 (목업 - 실제로는 API에서 가져와야 함)
  const folders = useMemo(() => {
    const folderMap: Record<string, number> = {};
    
    books.forEach((book) => {
      if (book.category) {
        const categoryLabel = BOOK_CATEGORY_LABELS[book.category as keyof typeof BOOK_CATEGORY_LABELS] || book.category;
        folderMap[categoryLabel] = (folderMap[categoryLabel] || 0) + 1;
      }
    });

    const colors = [
      'bg-[#8B7355]', // 갈색
      'bg-[#8A9A7B]', // 세이지 그린
      'bg-[#C9A961]', // 골드
      'bg-[#B85C4F]', // 테라코타
    ];

    return Object.entries(folderMap).slice(0, 4).map(([name, count], index) => ({
      id: name,
      name,
      count,
      color: colors[index % colors.length],
    }));
  }, [books]);

  const handleFolderClick = (folderId: string) => {
    setActiveTab(folderId);
  };

  return (
    <main className="min-h-screen bg-[#F4F2F0]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <LibraryHeader totalCount={totalCount} />

        {/* 검색 바 */}
        <div className="mb-6">
          <div onClick={() => setIsSearchModalOpen(true)}>
            <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {/* 검색 모달 */}
        {isSearchModalOpen && (
          <SearchModal onClose={() => setIsSearchModalOpen(false)} />
        )}

        {/* 탭 */}
        <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

        {/* 폴더 섹션 */}
        {folders.length > 0 && (
          <LibraryFolders folders={folders} onFolderClick={handleFolderClick} />
        )}

        {/* 책 그리드 */}
        <LibraryBooksGrid books={filteredBooks} />
      </div>
    </main>
  );
}
