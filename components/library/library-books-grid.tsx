'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserBookResponse } from '@/lib/types/book/book';

interface LibraryBooksGridProps {
  books: UserBookResponse[];
}

export function LibraryBooksGrid({ books }: LibraryBooksGridProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-[#EAEAEA] bg-white p-12 text-center">
        <p className="text-sm text-[#8C8C8C]">등록된 책이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#2C2622]">책</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.id}`}
            className="group cursor-pointer"
          >
            <div className="mb-2 aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-transform group-hover:scale-105">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  width={200}
                  height={300}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-200">
                  <span className="text-2xl">📚</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="line-clamp-1 text-sm font-medium text-[#2C2622] group-hover:text-[#4E4036]">
                {book.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-[#8C8C8C]">
                {book.author}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
