'use client'
import { AddBookDialog } from "@/components/book/AddBookDialog";
import { useAuth } from "@/components/context/AuthContext";
import { useSidebar } from "@/components/context/SidebarContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNextAuth } from "@/hooks/use-next-auth";
import {
  Book,
  FileText,
  Home,
  Plus,
  Settings,
  TrendingUp,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface NavigationProps {
  currentPage: string;
}

const Navigation = ({ currentPage }: NavigationProps) => {
  const router = useRouter();
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const { logout } = useNextAuth();
  const { user } = useAuth();
  const { stats } = useDashboardStats();
  const { closeSidebar } = useSidebar();
  const isMobile = useIsMobile();

  const navItems = useMemo(() => ([
    { id: 'dashboard', label: '대시보드', icon: Home, count: null as number | null, path: '/dashboard' },
    { id: 'books', label: '내 서재', icon: Book, count: stats?.books?.total || 0, path: '/books' },
    { id: 'notes', label: '노트', icon: FileText, count: stats?.notes?.total || 0, path: '/notes' },
    // { id: 'review', label: '복습', icon: Brain, count: 8, path: '/review' },
    { id: 'statistics', label: '통계', icon: TrendingUp, count: null as number | null, path: '/statistics' },
  ]), [stats]);

  const handleNavigation = (item: typeof navItems[0]) => {
    router.push(`${item.path}`);
    // 모바일에서는 네비게이션 클릭 시 사이드바 닫기
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleAddBook = () => {
    setIsAddBookDialogOpen(true);
    // 모바일에서는 다이얼로그 열 때 사이드바 닫기
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <nav className="sidebar-nav w-64 flex flex-col h-screen bg-background border-r border-border overflow-y-auto">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Book className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Booknote</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">독서 노트 관리</p>
          </div>
        </div>
      </div>

      {/* Quick Create */}
      <div className="p-3 sm:p-4 border-b border-border flex-shrink-0">
        <Button 
          className="w-full justify-start bg-gradient-primary hover:opacity-90 text-sm sm:text-base"
          onClick={handleAddBook}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          책 추가
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`
                  w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== null && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="text-xs flex-shrink-0"
                  >
                    {item.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-border flex-shrink-0">
          <h3 className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">최근 활동</h3>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 3).map((activity, index) => {
              const getActivityIcon = (type: string) => {
                switch (type) {
                  case 'note_created':
                    return 'bg-primary';
                  case 'book_added':
                    return 'bg-blue-500';
                  case 'quote_added':
                    return 'bg-purple-500';
                  case 'book_finished':
                    return 'bg-green-500';
                  default:
                    return 'bg-gray-500';
                }
              };

              const getActivityText = (type: string, bookTitle: string) => {
                switch (type) {
                  case 'note_created':
                    return `${bookTitle} 노트 작성`;
                  case 'book_added':
                    return `새 책 '${bookTitle}' 추가`;
                  case 'quote_added':
                    return `${bookTitle} 인용구 추가`;
                  case 'book_finished':
                    return `${bookTitle} 완독`;
                  default:
                    return activity.bookTitle;
                }
              };

              return (
                <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${getActivityIcon(activity.type)} rounded-full flex-shrink-0`}></div>
                  <span className="truncate">{getActivityText(activity.type, activity.bookTitle)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings & Auth */}
      <div className="p-3 sm:p-4 border-t border-border space-y-2 flex-shrink-0">
        {user && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground text-xs sm:text-sm"
            onClick={() => {
              router.push('/profile');
              if (isMobile) closeSidebar();
            }}
          >
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            프로필
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground text-xs sm:text-sm"
          onClick={() => {
            router.push('/settings');
            if (isMobile) closeSidebar();
          }}
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          설정
        </Button>

        {!user ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs sm:text-sm"
            onClick={() => {
              router.push('/auth');
              if (isMobile) closeSidebar();
            }}
          >
            로그인
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-6 sm:size-7">
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs sm:text-sm font-medium truncate max-w-[7rem] sm:max-w-[9rem]">사용자</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-destructive text-xs sm:text-sm"
            >
              로그아웃
            </Button>
          </div>
        )}
      </div>

      {/* Add Book Dialog */}
      <AddBookDialog 
        open={isAddBookDialogOpen} 
        onOpenChange={setIsAddBookDialogOpen} 
      />
    </nav>
  );
};

export default Navigation;