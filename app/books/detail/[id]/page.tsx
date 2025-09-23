import BookDetailClient from "./BookDetailClient";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  return (
    <BookDetailClient bookId={id} />
  );
}