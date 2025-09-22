import BookDetailClient from "./BookDetailClient";

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

export default function BookDetailPage({ params }: BookDetailPageProps) {
  return (
    <BookDetailClient bookId={params.id} />
  );
}