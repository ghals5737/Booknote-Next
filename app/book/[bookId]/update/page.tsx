import { authOptions } from "@/lib/auth";
import { BookDetailData } from "@/lib/types/book/book";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookUpdateClient } from "./BookUpdateClient";

const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:9500";

async function fetchBookDetail(bookId: string): Promise<BookDetailData> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    redirect("/auth");
  }

  const response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1/user/books/${bookId}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("책 정보를 불러오는데 실패했습니다.");
  }

  const data = await response.json();
  return data.data || data;
}

export default async function BookUpdatePage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const initialData = await fetchBookDetail(bookId);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/book/${bookId}`}
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← 책 상세로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">책 정보 수정</h1>
          <p className="text-muted-foreground">
            책 정보를 수정하고 저장하면 내 서재에 반영됩니다.
          </p>
        </div>

        <BookUpdateClient bookId={bookId} initialData={initialData} />
      </main>
    </div>
  );
}

