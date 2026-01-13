'use client';

import { X, Plus, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Book {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  progress?: number;
}

interface BookSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onAddBook: () => void;
  recordType?: 'quote' | 'note';
}

export function BookSelectionModal({ 
  isOpen, 
  onClose, 
  books, 
  onAddBook,
  recordType = 'note'
}: BookSelectionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const recordTypeLabel = recordType === 'quote' ? '인용구' : '노트';

  const handleSelectBook = (book: Book) => {
    if (recordType === 'quote') {
      router.push(`/book/${book.id}/quote/new`);
    } else {
      router.push(`/book/${book.id}/note/new`);
    }
    onClose();
  };

  const handleAddBook = () => {
    router.push('/book/add');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#FFFEF9] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAEAEA]">
          <div>
            <h2 className="text-xl font-semibold text-[#2C2622]">어떤 책의 {recordTypeLabel}인가요?</h2>
            <p className="text-sm text-[#8C8C8C] mt-1">
              {recordTypeLabel}를 기록할 책을 선택해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
          >
            <X className="h-5 w-5 text-[#8C8C8C]" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          {books.length > 0 ? (
            <div className="p-6">
              <div className="space-y-3">
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#EAEAEA] bg-white hover:border-[#4E4036]/30 hover:bg-[#FAFAFA] transition-all duration-200 text-left group w-full"
                  >
                    {/* 책 표지 */}
                    <div className="relative h-20 w-14 rounded-lg shadow-md overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#E6DCCA]">
                          <BookOpen className="h-8 w-8 text-[#8C8C8C]" />
                        </div>
                      )}
                    </div>

                    {/* 책 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base font-medium text-[#2C2622] truncate group-hover:text-[#4E4036] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-[#8C8C8C] truncate mt-1">
                        {book.author}
                      </p>
                      {book.progress !== undefined && book.progress > 0 && book.progress < 100 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#4E4036] rounded-full transition-all"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#8C8C8C] font-medium">
                            {book.progress}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 아이콘 */}
                    <div className="text-[#8C8C8C] group-hover:text-[#4E4036] transition-colors">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E6DCCA] mb-4">
                <BookOpen className="h-8 w-8 text-[#8C8C8C]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C2622] mb-2">아직 등록된 책이 없어요</h3>
              <p className="text-sm text-[#8C8C8C] mb-6">
                책을 추가하고 {recordTypeLabel}를 기록해보세요
              </p>
              <button
                onClick={handleAddBook}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4E4036] text-white hover:bg-[#3A3029] transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="h-5 w-5" />
                <span>책 추가하기</span>
              </button>
            </div>
          )}
        </div>

        {/* 하단 액션 */}
        {books.length > 0 && (
          <div className="px-6 py-4 border-t border-[#EAEAEA] bg-[#FAFAFA]">
            <button
              onClick={handleAddBook}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[#EAEAEA] hover:border-[#4E4036]/30 hover:bg-white transition-all duration-200 text-[#8C8C8C] hover:text-[#2C2622]"
            >
              <Plus className="h-5 w-5" />
              <span>다른 책 추가하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
