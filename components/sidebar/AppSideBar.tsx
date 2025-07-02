"use client"

import { BookOpen, Search, RotateCcw, BarChart3, Home, Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useBook } from "@/components/context/BookContext"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "내 서재",
    icon: Home,
    view: "library" as const,
  },
  {
    title: "검색",
    icon: Search,
    view: "search" as const,
  },
  {
    title: "리마인드",
    icon: RotateCcw,
    view: "remind" as const,
  },
  {
    title: "통계",
    icon: BarChart3,
    view: "stats" as const,
  },
]

export function AppSidebar() {
  const { currentView, setCurrentView, books } = useBook()
  const router = useRouter()
  const handleClick = (view: "library" | "book-detail" | "note-editor" | "search" | "remind" | "stats") => {
    setCurrentView(view)
    router.push(`/${view}`)
  }

  return (
    <Sidebar className="border-r border-secondary bg-background">
      <SidebarHeader className="border-b border-secondary">
        <div className="flex items-center gap-3 px-3 py-4 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Booknote</h1>
            <p className="text-sm text-cool">Smart Library</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SidebarMenuButton
                    onClick={() => handleClick(item.view)}
                    isActive={currentView === item.view}
                    className="text-cool hover:bg-secondary hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-white"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-accent font-medium">최근 읽은 책</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {books.slice(0, 3).map((book, index) => (
                <SidebarMenuItem key={book.id} className="animate-slide-up animation-delay-200">
                  <SidebarMenuButton
                    onClick={() => {
                      setCurrentView("book-detail")
                    }}
                    className="text-cool hover:bg-secondary hover:text-foreground transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="truncate">{book.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-secondary bg-background p-4">
        <Button className="w-full hover:from-primary/90 hover:to-accent/90 text-white rounded-xl" onClick={() => setCurrentView("library")}>
          <Plus className="h-4 w-4 mr-2" />새 책 추가
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
