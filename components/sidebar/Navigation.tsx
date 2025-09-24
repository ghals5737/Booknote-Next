'use client'
import { AddBookDialog } from "@/components/book/AddBookDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useNextAuth } from "@/hooks/use-next-auth";
import {
  Book,
  Brain,
  FileText,
  Home,
  Plus,
  Settings,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface NavigationProps {
  currentPage: string;
}

const Navigation = ({ currentPage }: NavigationProps) => {
  const router = useRouter();
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const { user, logout } = useNextAuth();
  const { stats } = useDashboardStats();

  const navItems = useMemo(() => ([
    { id: 'dashboard', label: '대시보드', icon: Home, count: null as number | null, path: '/dashboard' },
    { id: 'books', label: '내 서재', icon: Book, count: stats?.books?.total || 0, path: '/books' },
    { id: 'notes', label: '노트', icon: FileText, count: stats?.notes?.total || 0, path: '/notes' },
    { id: 'review', label: '복습', icon: Brain, count: 8, path: '/review' },
    { id: 'statistics', label: '통계', icon: TrendingUp, count: null as number | null, path: '/statistics' },
  ]), [stats]);

  const handleNavigation = (item: typeof navItems[0]) => {
    router.push(`${item.path}`);
  };

  const handleAddBook = () => {
    setIsAddBookDialogOpen(true);
  };

  return (
    <nav className="sidebar-nav w-64 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Book className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Booknote</h1>
            <p className="text-xs text-muted-foreground">독서 노트 관리</p>
          </div>
        </div>
      </div>

      {/* Quick Create */}
      <div className="p-4 border-b border-border">
        <Button 
          className="w-full justify-start bg-gradient-primary hover:opacity-90"
          onClick={handleAddBook}
        >
          <Plus className="h-4 w-4 mr-2" />
          책 추가
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="text-xs"
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
        <div className="p-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">최근 활동</h3>
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
                  <div className={`w-2 h-2 ${getActivityIcon(activity.type)} rounded-full`}></div>
                  <span className="truncate">{getActivityText(activity.type, activity.bookTitle)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings & Auth */}
      <div className="p-4 border-t border-border space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          설정
        </Button>

        {!user ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => router.push('/auth')}
          >
            로그인
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-7">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-medium truncate max-w-[9rem]">사용자</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
              className="text-destructive"
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