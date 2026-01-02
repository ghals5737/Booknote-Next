'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserBookResponse } from "@/lib/types/book/book";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReadingBooksSectionProps {
  books: UserBookResponse[];
  onStartTimer: (bookId: number) => void;
}

export function ReadingBooksSection({ books, onStartTimer }: ReadingBooksSectionProps) {
  if (books.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">지금 읽던 책 이어서 읽기</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    {book.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{book.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 truncate">{book.author}</p>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-semibold">{book.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Link href={`/book/${book.id}`}>
                      이어서 읽기
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onStartTimer(book.id)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    타이머
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

