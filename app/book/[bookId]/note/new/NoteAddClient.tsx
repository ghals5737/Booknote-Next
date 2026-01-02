'use client'
import NoteEditor from "@/components/note/NoteEditor";

export default function NoteAddClient({ bookId, bookTitle }: { bookId: string; bookTitle?: string }) {   

    return (
        <div>
            <NoteEditor 
                bookId={bookId}
                isEditMode={false}
                bookTitle={bookTitle}
            />
        </div>
    )
}