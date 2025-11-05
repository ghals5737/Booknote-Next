import QuoteAddClient from "./QuoteAddClient"



export default async function AddQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  
  

  return (
    <QuoteAddClient bookId={id} />
  )
}
