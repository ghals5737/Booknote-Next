import NoteAddClient from "./NoteAddClient";

export default async function AddNotePage({ params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = await params
    
    return (
        <NoteAddClient bookId={bookId} />
    )
}