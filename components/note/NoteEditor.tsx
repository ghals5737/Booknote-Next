import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Bold,
    BookOpen,
    Calendar,
    Code,
    Eye,
    EyeOff,
    Hash,
    Heart,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    Palette,
    Plus,
    Quote,
    Save,
    Share,
    Tag,
    Trash2
} from "lucide-react";
import { useRef, useState } from "react";

const NoteEditor = () => {
  const [title, setTitle] = useState("새로운 노트");
  const [selectedBook, setSelectedBook] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [content, setContent] = useState(`# 마크다운 편집기

이곳에서 **마크다운**으로 노트를 작성할 수 있습니다.

## 주요 기능

- *기울임체*와 **굵은 글씨**
- [링크](https://example.com)
- \`인라인 코드\`

> 인용구는 이렇게 작성합니다.

### 연결된 노트
- [[원자 습관]] - 작은 변화의 힘
- [[학습 방법론]] - 효과적인 학습 전략

---

이 노트는 다른 노트들과 연결되어 지식 네트워크를 형성합니다.`);
  
  const [tags, setTags] = useState(["학습", "마크다운", "지식관리"]);
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  
  // 좋아하는 문장 관리
  const [favoriteQuotes, setFavoriteQuotes] = useState([
    {
      id: 1,
      text: "습관은 복리와 같다. 매일 1%씩 개선하면 1년 후 37배 더 나아진다.",
      page: 45,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      text: "작은 변화들이 쌓여서 놀라운 결과를 만든다.",
      page: 67,
      createdAt: "2024-01-16"
    }
  ]);
  const [newQuote, setNewQuote] = useState("");
  const [quotePage, setQuotePage] = useState("");

  // 사용 가능한 책 목록
  const [availableBooks] = useState([
    { id: 1, title: "원자 습관", author: "제임스 클리어" },
    { id: 2, title: "클린 코드", author: "로버트 마틴" },
    { id: 3, title: "사피엔스", author: "유발 하라리" }
  ]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addQuote = () => {
    if (newQuote.trim()) {
      const quote = {
        id: favoriteQuotes.length + 1,
        text: newQuote.trim(),
        page: parseInt(quotePage) || 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setFavoriteQuotes([...favoriteQuotes, quote]);
      setNewQuote("");
      setQuotePage("");
    }
  };

  const removeQuote = (quoteId: number) => {
    setFavoriteQuotes(favoriteQuotes.filter(quote => quote.id !== quoteId));
  };

  const renderMarkdownPreview = (text: string) => {
    // Simple markdown rendering (in a real app, use a proper markdown parser)
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="note-link">$1</a>')
      .replace(/\[\[(.*?)\]\]/g, '<a href="#" class="note-link bg-primary-muted px-1 py-0.5 rounded">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^---$/gm, '<hr class="my-6 border-border">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none shadow-none p-0 h-auto bg-transparent"
                placeholder="노트 제목..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>노트</span>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>좋아하는 문장</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes">
                <Card className="knowledge-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-primary" />
                        <span>마크다운 편집기</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                      </Button>
                    </div>
                
                {/* Toolbar */}
                <div className="flex items-center space-x-1 p-2 bg-muted/30 rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("**", "**")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("*", "*")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("- ")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("1. ")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("> ")}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("`", "`")}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("[", "](url)")}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("![](", ")")}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => insertMarkdown("[[", "]]")}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {/* Editor Pane */}
                  <div>
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="마크다운으로 노트를 작성하세요..."
                      className="min-h-[600px] font-mono text-sm leading-relaxed resize-none border-0 shadow-none p-4 bg-muted/20"
                    />
                  </div>
                  
                  {/* Preview Pane */}
                  {showPreview && (
                    <div className="border-l border-border pl-4">
                      <div className="min-h-[600px] p-4 bg-reading-bg rounded-lg">
                        <div 
                          className="prose prose-sm max-w-none text-reading-text leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="quotes">
                <Card className="knowledge-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span>좋아하는 문장</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 새 문장 추가 */}
                      <div className="p-4 bg-muted/20 rounded-lg space-y-3">
                        <Textarea
                          value={newQuote}
                          onChange={(e) => setNewQuote(e.target.value)}
                          placeholder="마음에 드는 문장을 입력하세요..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={quotePage}
                            onChange={(e) => setQuotePage(e.target.value)}
                            placeholder="페이지"
                            className="w-20"
                          />
                          <Button onClick={addQuote}>
                            <Plus className="h-4 w-4 mr-2" />
                            추가
                          </Button>
                        </div>
                      </div>

                      {/* 저장된 문장들 */}
                      <div className="space-y-3">
                        {favoriteQuotes.map((quote) => (
                          <Card key={quote.id} className="bg-gradient-warm">
                            <CardContent className="p-4">
                              <blockquote className="text-foreground mb-2 leading-relaxed">
                                "{quote.text}"
                              </blockquote>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {quote.page}페이지
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(quote.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuote(quote.id)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {favoriteQuotes.length === 0 && (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">아직 저장한 문장이 없습니다</h3>
                          <p className="text-muted-foreground">마음에 드는 문장을 저장해보세요</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Selection */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>소속 도서</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue placeholder="책을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.title}>
                          {book.title} - {book.author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedBook && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">현재 페이지</label>
                      <Input
                        type="number"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(e.target.value)}
                        placeholder="페이지 번호"
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    새 책 추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>태그</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="새 태그..."
                      className="text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button size="sm" onClick={addTag}>
                      추가
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Linked Notes */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Link className="h-4 w-4 text-primary" />
                  <span>연결된 노트</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">원자 습관</p>
                    <p className="text-xs text-muted-foreground">작은 변화의 힘</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">학습 방법론</p>
                    <p className="text-xs text-muted-foreground">효과적인 학습 전략</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    노트 연결 추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="knowledge-card">
              <CardHeader>
                <CardTitle className="text-base">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Palette className="h-4 w-4 mr-2" />
                    하이라이트 추가
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Hash className="h-4 w-4 mr-2" />
                    플래시카드 생성
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;