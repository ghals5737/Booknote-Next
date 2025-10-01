import NoteEditor from "@/components/note/NoteEditor";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { Suspense } from "react";

export default function NotesCreatePage() {
    return (
        <SWRProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <NoteEditor />
            </Suspense>
        </SWRProvider>
    )
}