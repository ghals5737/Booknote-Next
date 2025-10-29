'use client';

import { RecentBooks } from "../../../components/new/book/recent-books";
import { MyLibrary } from "../../../components/new/library/my-library";
import { UserBookResponsePage } from "../../../lib/types/book/book";

interface DashboardClientProps {
    booksData: UserBookResponsePage;
}

export default function DashboardClient({ booksData }: DashboardClientProps) {
    return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <RecentBooks />
    <MyLibrary />
</main>
}