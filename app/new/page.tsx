import { RecentBooks } from "@/components/new/book/recent-books"
import { ActionCards } from "@/components/new/common/action-cards"
import { WelcomeSection } from "@/components/new/common/welcome-section"
import { Header } from "@/components/new/header"
import { MyLibrary } from "@/components/new/library/my-library"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <WelcomeSection />
        <ActionCards />
        <RecentBooks />
        <MyLibrary />
      </main>
    </div>
  )
}
