import NoteAddClient from "./NoteAddClient";

export default async function AddNotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    return (
        <NoteAddClient bookId={id} />
    )
}