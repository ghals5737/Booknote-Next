'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Book,
  Calendar,
  FileText,
  Filter,
  Grid3X3,
  Link,
  List,
  Plus,
  Search,
  Tag
} from "lucide-react";
import { useState } from "react";

const NotesPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [notes] = useState([
    {
      id: 1,
      title: "원자 습관 - 작은 변화의 놀라운 힘",
      excerpt: "습관은 복리와 같다. 매일 1%씩 개선하면 1년 후 37배 더 나아진다...",
      tags: ["자기계발", "습관", "성장"],
      linkedNotes: 5,
      lastModified: "2시간 전",
      source: "원자 습관 - 제임스 클리어",
      type: "book"
    },
    {
      id: 2,
      title: "인지 부하 이론과 학습 효율성",
      excerpt: "인지 부하 이론에 따르면 우리의 작업 기억은 제한적이며, 효과적인 학습을 위해서는...",
      tags: ["학습", "심리학", "인지과학"],
      linkedNotes: 8,
      lastModified: "1일 전",
      source: "교육 심리학 연구",
      type: "research"
    },
    {
      id: 3,
      title: "React 컴포넌트 설계 원칙",
      excerpt: "좋은 React 컴포넌트는 단일 책임 원칙을 따르고, 재사용 가능하며...",
      tags: ["개발", "React", "프론트엔드"],
      linkedNotes: 12,
      lastModified: "3일 전",
      source: "클린 코드 in React",
      type: "article"
    },
    {
      id: 4,
      title: "디자인 시스템의 핵심 요소",
      excerpt: "일관된 사용자 경험을 위한 디자인 시스템은 색상, 타이포그래피, 컴포넌트...",
      tags: ["디자인", "UI/UX", "시스템"],
      linkedNotes: 3,
      lastModified: "1주 전",
      source: "디자인 시스템 가이드",
      type: "article"
    },
    {
      id: 5,
      title: "마음챙김과 집중력 향상",
      excerpt: "마음챙김 명상은 뇌의 전전두엽을 강화하여 집중력과 감정 조절 능력을...",
      tags: ["명상", "집중력", "뇌과학"],
      linkedNotes: 7,
      lastModified: "2주 전",
      source: "마음챙김의 과학",
      type: "book"
    },
    {
      id: 6,
      title: "지식 관리와 제텔카스텐 방법",
      excerpt: "제텔카스텐은 연결된 사고를 통해 창의적 아이디어를 생성하는 지식 관리 시스템...",
      tags: ["지식관리", "생산성", "창의성"],
      linkedNotes: 15,
      lastModified: "3주 전",
      source: "How to Take Smart Notes",
      type: "book"
    }
  ]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'research':
        return <Search className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeText = (type: string) => {
    switch (type) {
      case 'book':
        return '도서';
      case 'article':
        return '기사';
      case 'research':
        return '연구';
      default:
        return '노트';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">내 노트</h1>
              <Badge variant="secondary">{filteredNotes.length}개</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="노트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
              
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                정렬
              </Button>
              
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 노트
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Notes Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(note.type)}
                      <Badge variant="secondary" className="text-xs">
                        {getTypeBadgeText(note.type)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{note.lastModified}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {note.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Link className="h-3 w-3 mr-1" />
                      {note.linkedNotes}개 연결
                    </span>
                    <span className="truncate ml-2">{note.source}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="knowledge-card cursor-pointer group hover:shadow-[var(--shadow-knowledge)] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(note.type)}
                          <Badge variant="secondary" className="text-xs">
                            {getTypeBadgeText(note.type)}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {note.title}
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {note.excerpt}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {note.lastModified}
                        </span>
                        <span className="flex items-center">
                          <Link className="h-4 w-4 mr-1" />
                          {note.linkedNotes}개 연결
                        </span>
                        <span className="truncate">{note.source}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">다른 키워드로 검색해보세요</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 노트 작성
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="floating-action">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default NotesPage;