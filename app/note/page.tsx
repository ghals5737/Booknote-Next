"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Star, Tag, Plus, FileText, Quote, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBook } from "@/components/context/BookContext"

export default function NoteEditorView() {
  const { selectedBook, selectedNote, setCurrentView, addNote, updateNote, addQuote } = useBook()

  // Note states
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isImportant, setIsImportant] = useState(false)

  // Quote states
  const [quoteText, setQuoteText] = useState("")
  const [quotePage, setQuotePage] = useState<number | undefined>()
  const [quoteChapter, setQuoteChapter] = useState("")
  const [quoteThoughts, setQuoteThoughts] = useState("")
  const [quoteTags, setQuoteTags] = useState<string[]>([])
  const [newQuoteTag, setNewQuoteTag] = useState("")
  const [isQuoteImportant, setIsQuoteImportant] = useState(false)

  const [activeTab, setActiveTab] = useState("note")

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setTags(selectedNote.tags)
      setIsImportant(selectedNote.isImportant)
      setActiveTab("note")
    } else {
      setTitle("")
      setContent("")
      setTags([])
      setIsImportant(false)
      setQuoteText("")
      setQuotePage(undefined)
      setQuoteChapter("")
      setQuoteThoughts("")
      setQuoteTags([])
      setIsQuoteImportant(false)
    }
  }, [selectedNote])

  const handleSaveNote = () => {
    if (!selectedBook || !title.trim() || !content.trim()) return

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags,
      isImportant,
    }

    if (selectedNote) {
      updateNote(selectedBook.id, selectedNote.id, noteData)
    } else {
      addNote(selectedBook.id, noteData)
    }

    setCurrentView("book-detail")
  }

  const handleSaveQuote = () => {
    if (!selectedBook || !quoteText.trim()) return

    const quoteData = {
      text: quoteText.trim(),
      page: quotePage,
      chapter: quoteChapter.trim() || undefined,
      thoughts: quoteThoughts.trim() || undefined,
      tags: quoteTags,
      isImportant: isQuoteImportant,
    }

    addQuote(selectedBook.id, quoteData)

    // Reset quote form
    setQuoteText("")
    setQuotePage(undefined)
    setQuoteChapter("")
    setQuoteThoughts("")
    setQuoteTags([])
    setIsQuoteImportant(false)

    setCurrentView("book-detail")
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddQuoteTag = () => {
    if (newQuoteTag.trim() && !quoteTags.includes(newQuoteTag.trim())) {
      setQuoteTags([...quoteTags, newQuoteTag.trim()])
      setNewQuoteTag("")
    }
  }

  const handleRemoveQuoteTag = (tagToRemove: string) => {
    setQuoteTags(quoteTags.filter((tag) => tag !== tagToRemove))
  }

  if (!selectedBook) {
    return (
      <div className="p-6 bg-content min-h-full">
        <p className="text-cool">책을 선택해주세요.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-content min-h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView("book-detail")}
            className="text-cool hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />책 상세로 돌아가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedNote ? "노트 수정" : "새 노트/문장 작성"}</h1>
            <p className="text-cool">{selectedBook.title}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg">
          <TabsTrigger value="note" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            노트 작성
          </TabsTrigger>
          <TabsTrigger value="quote" className="flex items-center gap-2">
            <Quote className="h-4 w-4" />
            좋아하는 문장
          </TabsTrigger>
        </TabsList>

        <TabsContent value="note" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="border-secondary bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    노트 작성
                    <Button
                      onClick={handleSaveNote}
                      disabled={!title.trim() || !content.trim()}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="노트 제목을 입력하세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                    />
                    <Button
                      variant={isImportant ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsImportant(!isImportant)}
                      className={
                        isImportant
                          ? "bg-accent hover:bg-accent/90 text-white"
                          : "border-accent text-accent hover:bg-accent/10"
                      }
                    >
                      <Star className={`h-4 w-4 ${isImportant ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="노트 내용을 입력하세요..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] border-secondary focus:border-accent resize-none bg-muted text-foreground placeholder:text-cool"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="태그 추가"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                        className="flex-1 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                      />
                      <Button
                        onClick={handleAddTag}
                        size="sm"
                        variant="outline"
                        className="border-accent text-accent hover:bg-accent/10 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-ice text-primary cursor-pointer hover:bg-ice/80 border border-primary/20"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <span className="ml-1 text-xs">×</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-secondary bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {isImportant && <Star className="h-4 w-4 text-accent fill-current" />}
                      <h3 className="text-lg font-semibold text-foreground">{title || "제목을 입력하세요"}</h3>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-cool whitespace-pre-wrap">{content || "내용을 입력하세요..."}</p>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="border-accent/30 text-accent">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quote" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="border-secondary bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    좋아하는 문장 저장
                    <Button
                      onClick={handleSaveQuote}
                      disabled={!quoteText.trim()}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isQuoteImportant ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsQuoteImportant(!isQuoteImportant)}
                      className={
                        isQuoteImportant
                          ? "bg-accent hover:bg-accent/90 text-white"
                          : "border-accent text-accent hover:bg-accent/10"
                      }
                    >
                      <Star className={`h-4 w-4 ${isQuoteImportant ? "fill-current" : ""}`} />
                    </Button>
                    <span className="text-sm text-cool">중요한 문장으로 표시</span>
                  </div>

                  <Textarea
                    placeholder="좋아하는 문장을 입력하세요..."
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="min-h-[120px] border-secondary focus:border-accent resize-none bg-muted text-foreground placeholder:text-cool"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-cool font-medium">페이지</label>
                      <Input
                        type="number"
                        placeholder="페이지 번호"
                        value={quotePage || ""}
                        onChange={(e) => setQuotePage(e.target.value ? Number(e.target.value) : undefined)}
                        className="border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-cool font-medium">챕터</label>
                      <Input
                        placeholder="챕터명 (선택사항)"
                        value={quoteChapter}
                        onChange={(e) => setQuoteChapter(e.target.value)}
                        className="border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-cool font-medium">나의 생각</label>
                    <Textarea
                      placeholder="이 문장에 대한 나의 생각이나 감상을 적어보세요..."
                      value={quoteThoughts}
                      onChange={(e) => setQuoteThoughts(e.target.value)}
                      className="min-h-[100px] border-secondary focus:border-accent resize-none bg-muted text-foreground placeholder:text-cool"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="태그 추가"
                        value={newQuoteTag}
                        onChange={(e) => setNewQuoteTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddQuoteTag()}
                        className="flex-1 border-secondary focus:border-accent bg-muted text-foreground placeholder:text-cool"
                      />
                      <Button
                        onClick={handleAddQuoteTag}
                        size="sm"
                        variant="outline"
                        className="border-accent text-accent hover:bg-accent/10 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {quoteTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {quoteTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-ice text-primary cursor-pointer hover:bg-ice/80 border border-primary/20"
                            onClick={() => handleRemoveQuoteTag(tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <span className="ml-1 text-xs">×</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-secondary bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      {isQuoteImportant && <Star className="h-4 w-4 text-accent fill-current mt-1" />}
                      <div className="flex-1">
                        <Quote className="h-6 w-6 text-accent mb-2" />
                        <blockquote className="text-foreground italic border-l-4 border-accent pl-4 mb-3">
                          {quoteText || "좋아하는 문장을 입력하세요..."}
                        </blockquote>
                      </div>
                    </div>

                    {(quotePage || quoteChapter) && (
                      <div className="flex items-center gap-4 text-sm text-cool">
                        {quotePage && (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>페이지 {quotePage}</span>
                          </div>
                        )}
                        {quoteChapter && <span>{quoteChapter}</span>}
                      </div>
                    )}

                    {quoteThoughts && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-cool">나의 생각</h4>
                        <p className="text-cool/80 text-sm leading-relaxed">{quoteThoughts}</p>
                      </div>
                    )}

                    {quoteTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary">
                        {quoteTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="border-accent/30 text-accent">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">작성 가이드</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-cool space-y-2">
                  <p>
                    💡 <strong>좋아하는 문장</strong>: 인상 깊었던 구절을 그대로 입력하세요
                  </p>
                  <p>
                    📖 <strong>페이지/챕터</strong>: 나중에 다시 찾기 쉽도록 위치를 기록하세요
                  </p>
                  <p>
                    💭 <strong>나의 생각</strong>: 왜 이 문장이 좋았는지, 어떤 감정을 느꼈는지 적어보세요
                  </p>
                  <p>
                    🏷️ <strong>태그</strong>: 감정, 주제, 키워드 등으로 분류해보세요
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
