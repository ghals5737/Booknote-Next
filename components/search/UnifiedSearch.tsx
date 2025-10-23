'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUnifiedSearch } from '@/hooks/use-unified-search';
import { SearchResult } from '@/lib/types/search/search';
import { Book, FileText, Loader2, Quote, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface UnifiedSearchProps {
  placeholder?: string;
  className?: string;
}

export function UnifiedSearch({ 
  placeholder = "노트, 책, 아이디어 검색...",
  className = ""
}: UnifiedSearchProps) {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    query,
    isOpen,
    setIsOpen,
    suggestionsData,
    allResults,
    isSearchLoading,
    handleQueryChange,
    executeSearch,
    clearSearch,
  } = useUnifiedSearch();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      executeSearch(query);
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // 검색 결과 클릭 처리
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    inputRef.current?.blur();
    
    // 타입에 따른 라우팅
    switch (result.type) {
      case 'book':
        router.push(`/books/detail/${result.id}`);
        break;
      case 'note':
        router.push(`/notes/detail/${result.id}`);
        break;
      case 'quote':
        // 인용구는 책 상세 페이지로 이동 (해당 책의 인용구 섹션)
        router.push(`/books/detail/${result.id}#quotes`);
        break;
    }
  };

  // 자동완성 제안 클릭 처리
  const handleSuggestionClick = (suggestion: { text: string; type: string }) => {
    executeSearch(suggestion.text);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // 아이콘 렌더링
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-4 w-4 text-blue-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'quote':
        return <Quote className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  // 타입 한글 변환
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'book':
        return '책';
      case 'note':
        return '노트';
      case 'quote':
        return '인용구';
      default:
        return type;
    }
  };

  const showDropdown = isOpen && (isFocused || query.trim());

  return (
    <div className={`relative ${className}`}>
      {/* 검색 입력창 */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim()) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-64 sm:w-80 pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearchLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 드롭다운 결과 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* 자동완성 제안 */}
              {!isSearchLoading && suggestionsData?.data?.suggestions && suggestionsData.data.suggestions.length > 0 && (
                <div className="border-b border-border">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30">
                    추천 검색어
                  </div>
                  {suggestionsData.data.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
                    >
                      <span className="text-sm">{suggestion.text}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* 검색 결과 */}
              {query.trim() && (
                <div>
                  {isSearchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">검색 중...</span>
                    </div>
                  ) : allResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/30">
                        검색 결과 ({allResults.length}개)
                      </div>
                      {allResults.slice(0, 8).map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border/50 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            {getTypeIcon(result.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(result.type)}
                                </Badge>
                              </div>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {result.subtitle}
                                </p>
                              )}
                              {result.content && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {result.content.length > 100 
                                    ? `${result.content.substring(0, 100)}...` 
                                    : result.content
                                  }
                                </p>
                              )}
                              {result.tagList && result.tagList.length > 0 && (
                                <div className="flex space-x-1 mt-2">
                                  {result.tagList.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">검색 결과가 없습니다</p>
                      <p className="text-xs mt-1">다른 검색어를 시도해보세요</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
