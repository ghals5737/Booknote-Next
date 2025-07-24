'use client'
import { useBook } from "@/components/context/BookContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface NavigationProps {
  currentPage: string;
}

const Navigation = ({ currentPage }: NavigationProps) => {
  const router = useRouter();
  const { books, setCurrentView } = useBook();

  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: Home, count: null, path: '/dashboard' },
    { id: 'books', label: '내 서재', icon: Book, count: books.length, path: '/books' },
    { id: 'notes', label: '노트', icon: FileText, count: books.reduce((acc, book) => acc + book.notes.length, 0), path: '/notes' },
    { id: 'review', label: '복습', icon: Brain, count: 8, path: '/review' },
    { id: 'statistics', label: '통계', icon: TrendingUp, count: null, path: '/statistics' },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    setCurrentView(item.id as "library" | "book-detail" | "note-editor" | "search" | "remind" | "stats" | "book" | "note");
    router.push(`${item.path}`);
  };

  const handleAddBook = () => {
    setCurrentView('library');
    router.push('/library');
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
      <div className="p-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">최근 활동</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>원자 습관 노트 수정</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>복습 카드 3개 완료</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{`새 책 '클린 코드' 추가`}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={() => router.push('/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          설정
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;