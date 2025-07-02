"use client"

import { useState, useMemo } from "react"
import { RotateCcw, Star, CheckCircle, Shuffle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBook } from "@/components/context/BookContext"

export default function RemindView() {
  const { books, setCurrentView, setSelectedBook, setSelectedNote } = useBook()
  const [completedNotes, setCompletedNotes] = useState<Set<string>>(new Set())

  const allNotes = useMemo(() => {
    return books.flatMap((book) =>
      book.notes.map((note) => ({
        ...note,
        bookTitle: book.title,
        bookId: book.id,
        book: book,
      })),
    )
  }, [books])

  const importantNotes = useMemo(() => {
    return allNotes.filter((note) => note.isImportant)
  }, [allNotes])

  const todayReminders = useMemo(() => {
    // 랜덤하게 5개의 노트를 선택 (중요한 노트 우선)
    const shuffled = [...allNotes].sort(() => Math.random() - 0.5)
    const important = shuffled.filter((note) => note.isImportant).slice(0, 3)
    const regular = shuffled.filter((note) => !note.isImportant).slice(0, 2)
    return [...important, ...regular]
  }, [allNotes])

  const handleNoteClick = (note: any) => {
    setSelectedBook(note.book)
    setSelectedNote(note)
    setCurrentView("note-editor")
  }

  const handleCompleteReminder = (noteId: string) => {
    setCompletedNotes((prev) => new Set([...prev, noteId]))
  }

  const getRandomNotes = () => {
    const shuffled = [...allNotes].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  }

  const [randomNotes, setRandomNotes] = useState(() => getRandomNotes())

  return (
    <div className="p-6 space-y-6 bg-content min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">리마인드</h1>
          <p className="text-cool mt-1">복습으로 기억을 더욱 단단하게 만들어보세요</p>
        </div>
        <Button
          onClick={() => setRandomNotes(getRandomNotes())}
          variant="outline"
          className="border-accent text-accent hover:bg-accent/10"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          랜덤 복습
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-secondary bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                오늘의 복습 ({todayReminders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayReminders.length === 0 ? (
                <p className="text-cool text-center py-4">복습할 노트가 없습니다.</p>
              ) : (
                todayReminders.map((note) => (
                  <div
                    key={`${note.bookId}-${note.id}`}
                    className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                      completedNotes.has(note.id)
                        ? "bg-green-50 border-green-200"
                        : "bg-muted border-secondary hover:border-accent"
                    }`}
                    onClick={() => !completedNotes.has(note.id) && handleNoteClick(note)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {note.isImportant && <Star className="h-4 w-4 text-accent fill-current" />}
                          <h4 className="font-medium text-foreground">{note.title}</h4>
                        </div>
                        <p className="text-sm text-cool line-clamp-2 mb-2">{note.content}</p>
                        <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                          {note.bookTitle}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={completedNotes.has(note.id) ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompleteReminder(note.id)
                        }}
                        className={
                          completedNotes.has(note.id)
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-accent text-accent hover:bg-accent/10"
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-secondary bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                중요 노트 ({importantNotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {importantNotes.length === 0 ? (
                <p className="text-cool text-center py-4">중요 표시된 노트가 없습니다.</p>
              ) : (
                importantNotes.slice(0, 5).map((note) => (
                  <div
                    key={`${note.bookId}-${note.id}`}
                    className="p-3 rounded-lg border border-accent/30 bg-accent/5 hover:border-accent/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handleNoteClick(note)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{note.title}</h4>
                        <p className="text-sm text-cool line-clamp-2 mb-2">{note.content}</p>
                        <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                          {note.bookTitle}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-secondary bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">복습 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted border border-secondary">
                  <div className="text-2xl font-bold text-foreground">{allNotes.length}</div>
                  <div className="text-sm text-cool">전체 노트</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="text-2xl font-bold text-foreground">{importantNotes.length}</div>
                  <div className="text-sm text-cool">중요 노트</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{completedNotes.size}</div>
                  <div className="text-sm text-green-600">오늘 복습</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-2xl font-bold text-foreground">{books.length}</div>
                  <div className="text-sm text-cool">읽은 책</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                랜덤 복습
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {randomNotes.map((note) => (
                <div
                  key={`random-${note.bookId}-${note.id}`}
                  className="p-3 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                  onClick={() => handleNoteClick(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.isImportant && <Star className="h-4 w-4 text-accent fill-current" />}
                        <h4 className="font-medium text-foreground">{note.title}</h4>
                      </div>
                      <p className="text-sm text-cool line-clamp-1 mb-2">{note.content}</p>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        {note.bookTitle}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
