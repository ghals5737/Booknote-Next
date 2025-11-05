'use client'
import { useState } from "react";
import NoteEditor from "../../../../../../components/note/NoteEditor";

export default function NoteAddClient({ bookId }: { bookId: string }) {   
    const [showNoteEditor, setShowNoteEditor] = useState(true);

    return (
        <div>
            <NoteEditor 
                
            />
        </div>
    )
}