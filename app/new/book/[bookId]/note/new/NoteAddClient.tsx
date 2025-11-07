'use client'
import NoteEditor from "@/components/note/NoteEditor";

export default function NoteAddClient({ bookId }: { bookId: string }) {   

    return (
        <div>
            <NoteEditor 
                bookId={bookId}
                isEditMode={false}                
            />
        </div>
    )
}