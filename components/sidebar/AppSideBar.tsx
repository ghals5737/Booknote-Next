"use client"

import { BookOpen, Search, RotateCcw, BarChart3, Home, Plus, LogOut, User } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBook } from "@/components/context/BookContext"
import { useNextAuth } from "@/hooks/use-next-auth"
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
  const { user, logout } = useNextAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }  

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
            <h1 className="text-xl font-bold text-gradient">Booknote</h1>
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
              {books.slice(0, 3).map((book) => (
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

      <SidebarFooter className="border-t border-secondary bg-background p-4 space-y-3">
        <Button className="w-full button-primary rounded-xl" onClick={() => setCurrentView("library")}>
          <Plus className="h-4 w-4 mr-2" />새 책 추가
        </Button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 h-auto hover:bg-secondary rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-accent text-white text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-cool truncate">{user?.email}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-secondary shadow-soft-lg">
            <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              프로필 설정
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-secondary" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
