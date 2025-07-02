"use client"
import { ArrowLeft, Plus, Edit, Star, Clock, Tag, User, Building, Hash, Calendar, QuoteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBook } from "@/components/context/BookContext"

export default function BookDetailView() {
  const { selectedBook, setCurrentView, setSelectedNote, updateBook } = useBook()

  if (!selectedBook) {
    return (
      <div className="p-6 bg-content min-h-full">
        <p className="text-cool">책을 선택해주세요.</p>
      </div>
    )
  }

  const handleNoteClick = (note: any) => {
    setSelectedNote(note)
    setCurrentView("note-editor")
  }

  const handleAddNote = () => {
    setSelectedNote(null)
    setCurrentView("note-editor")
  }

  const handleMarkAsFinished = () => {
    if (selectedBook.progress < 100) {
      updateBook(selectedBook.id, {
        progress: 100,
        currentPage: selectedBook.totalPages,
        endDate: new Date(),
      })
    }
  }

  const getReadingDuration = () => {
    if (!selectedBook.startDate) return null

    const start = selectedBook.startDate
    const end = selectedBook.endDate || new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const readingDuration = getReadingDuration()

  return (
    <div className="p-6 space-y-6 bg-content min-h-full animate-fade-in">
      <div className="flex items-center gap-4 animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => setCurrentView("library")}
          className="text-cool hover:bg-secondary hover:text-foreground rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          서재로 돌아가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-slide-up animation-delay-200">
          <Card className="border-secondary bg-card rounded-xl shadow-soft">
            <CardContent className="p-6">
              <div className="aspect-[3/4] w-full mb-4 rounded-lg overflow-hidden bg-muted shadow-soft">
                <img
                  src={selectedBook.cover || "/placeholder.svg"}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{selectedBook.title}</h2>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-cool">
                  <User className="h-4 w-4" />
                  <span>{selectedBook.author}</span>
                </div>
                {selectedBook.publisher && (
                  <div className="flex items-center gap-2 text-cool">
                    <Building className="h-4 w-4" />
                    <span>{selectedBook.publisher}</span>
                  </div>
                )}
                {selectedBook.isbn && (
                  <div className="flex items-center gap-2 text-cool">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm">ISBN: {selectedBook.isbn}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Badge variant="secondary" className="bg-ice text-primary border border-primary/20 rounded-lg">
                  {selectedBook.category}
                </Badge>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cool">읽기 진행률</span>
                    <span className="text-foreground font-medium">{selectedBook.progress}%</span>
                  </div>
                  <Progress value={selectedBook.progress} className="h-2 rounded-full" />

                  {selectedBook.totalPages > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cool">페이지 진행</span>
                      <span className="text-foreground font-medium">
                        {selectedBook.currentPage} / {selectedBook.totalPages}
                      </span>
                    </div>
                  )}

                  {selectedBook.progress < 100 && (
                    <Button
                      onClick={handleMarkAsFinished}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-accent text-accent hover:bg-accent/10 bg-transparent"
                    >
                      완독 표시
                    </Button>
                  )}
                </div>

                {/* Reading Period */}
                <div className="space-y-2 pt-2 border-t border-secondary">
                  <h4 className="text-sm font-medium text-cool flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    읽기 기간
                  </h4>
                  <div className="space-y-1 text-sm">
                    {selectedBook.startDate && (
                      <div className="flex justify-between">
                        <span className="text-cool">시작일:</span>
                        <span className="text-foreground">{selectedBook.startDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedBook.endDate && (
                      <div className="flex justify-between">
                        <span className="text-cool">완료일:</span>
                        <span className="text-foreground">{selectedBook.endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {readingDuration && (
                      <div className="flex justify-between">
                        <span className="text-cool">읽기 기간:</span>
                        <span className="text-foreground font-medium">
                          {readingDuration}일
                          {selectedBook.endDate && (
                            <Badge variant="outline" className="ml-2 text-xs border-green-300 text-green-600">
                              완독
                            </Badge>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBook.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-cool">책 소개</h4>
                    <p className="text-sm text-cool/80 leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}

                <div className="text-sm text-cool space-y-1 pt-2 border-t border-secondary">
                  <p>등록일: {selectedBook.createdAt.toLocaleDateString()}</p>
                  <p>노트: {selectedBook.notes.length}개</p>
                  <p>문장: {selectedBook.quotes.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 animate-slide-up animation-delay-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gradient">노트 & 문장</h3>
            <Button onClick={handleAddNote} className="button-primary rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              추가하기
            </Button>
          </div>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                노트 ({selectedBook.notes.length})
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-2">
                <QuoteIcon className="h-4 w-4" />
                좋아하는 문장 ({selectedBook.quotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4 mt-4">
              {selectedBook.notes.length === 0 ? (
                <Card className="border-secondary bg-card rounded-xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <Edit className="h-12 w-12 text-accent mx-auto mb-4" />
                    <p className="text-cool mb-4">아직 작성된 노트가 없습니다.</p>
                    <Button
                      onClick={handleAddNote}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent/10 rounded-lg bg-transparent"
                    >
                      첫 번째 노트 작성하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                selectedBook.notes.map((note, index) => (
                  <Card
                    key={note.id}
                    className="cursor-pointer card-hover border-secondary bg-card rounded-xl animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleNoteClick(note)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-foreground flex items-center gap-2">
                          {note.isImportant && <Star className="h-4 w-4 text-accent fill-current" />}
                          {note.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-cool hover:bg-secondary hover:text-foreground rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-cool mb-3 line-clamp-2">{note.content}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-accent" />
                          <div className="flex gap-1">
                            {note.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-accent/30 text-accent rounded"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-cool">
                          <Clock className="h-4 w-4" />
                          <span>{note.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="quotes" className="space-y-4 mt-4">
              {selectedBook.quotes.length === 0 ? (
                <Card className="border-secondary bg-card rounded-xl shadow-soft">
                  <CardContent className="p-8 text-center">
                    <QuoteIcon className="h-12 w-12 text-accent mx-auto mb-4" />
                    <p className="text-cool mb-4">아직 저장된 문장이 없습니다.</p>
                    <Button
                      onClick={handleAddNote}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent/10 rounded-lg bg-transparent"
                    >
                      첫 번째 문장 저장하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                selectedBook.quotes.map((quote, index) => (
                  <Card
                    key={quote.id}
                    className="border-secondary bg-card rounded-xl shadow-soft animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          {quote.isImportant && <Star className="h-4 w-4 text-accent fill-current mt-1" />}
                          <div className="flex-1">
                            <QuoteIcon className="h-5 w-5 text-accent mb-2" />
                            <blockquote className="text-foreground italic border-l-4 border-accent pl-4 mb-3 leading-relaxed">
                              {quote.text}
                            </blockquote>
                          </div>
                        </div>

                        {(quote.page || quote.chapter) && (
                          <div className="flex items-center gap-4 text-sm text-cool">
                            {quote.page && (
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                <span>페이지 {quote.page}</span>
                              </div>
                            )}
                            {quote.chapter && <span>{quote.chapter}</span>}
                          </div>
                        )}

                        {quote.thoughts && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-cool mb-2">나의 생각</h4>
                            <p className="text-cool/80 text-sm leading-relaxed">{quote.thoughts}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-accent" />
                            <div className="flex gap-1">
                              {quote.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs border-accent/30 text-accent rounded"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-cool">
                            <Clock className="h-4 w-4" />
                            <span>{quote.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
