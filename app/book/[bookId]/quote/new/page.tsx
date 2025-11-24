import QuoteAddClient from "./QuoteAddClient"



export default async function AddQuotePage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params  
  

  return (
    <QuoteAddClient bookId={bookId} />
  )
}
