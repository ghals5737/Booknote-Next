"use client"

import { useState, useMemo } from "react"
import { Search, BookOpen, FileText, Tag, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBook } from "@/components/context/BookContext"

export default function SearchView() {
  const { books, setCurrentView, setSelectedBook, setSelectedNote } = useBook()
  const [searchQuery, setSearchQuery] = useState("")

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { books: [], notes: [] }

    const query = searchQuery.toLowerCase()
    const matchedBooks = books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query),
    )

    const matchedNotes = books.flatMap((book) =>
      book.notes
        .filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
        .map((note) => ({ ...note, bookTitle: book.title, bookId: book.id })),
    )

    return { books: matchedBooks, notes: matchedNotes }
  }, [books, searchQuery])

  const handleBookClick = (book: any) => {
    setSelectedBook(book)
    setCurrentView("book-detail")
  }

  const handleNoteClick = (note: any) => {
    const book = books.find((b) => b.id === note.bookId)
    if (book) {
      setSelectedBook(book)
      setSelectedNote(note)
      setCurrentView("note-editor")
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-accent/20 text-accent px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="p-6 space-y-6 bg-content min-h-full">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">검색</h1>

        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent" />
          <Input
            placeholder="책 제목, 저자, 노트 내용, 태그를 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-secondary focus:border-accent text-lg py-3 bg-muted text-foreground placeholder:text-cool"
          />
        </div>
      </div>

      {searchQuery.trim() && (
        <div className="space-y-6">
          <div className="text-sm text-cool">
            검색 결과: 책 {searchResults.books.length}권, 노트 {searchResults.notes.length}개
          </div>

          {searchResults.books.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />책 ({searchResults.books.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.books.map((book) => (
                  <Card
                    key={book.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-secondary hover:border-accent bg-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5"
                    onClick={() => handleBookClick(book)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-16 rounded bg-muted flex-shrink-0">
                          <img
                            src={book.cover || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {highlightText(book.title, searchQuery)}
                          </h3>
                          <p className="text-sm text-cool truncate">{highlightText(book.author, searchQuery)}</p>
                          <Badge
                            variant="secondary"
                            className="bg-ice text-primary text-xs mt-1 border border-primary/20"
                          >
                            {highlightText(book.category, searchQuery)}
                          </Badge>
                          <p className="text-xs text-cool mt-1">{book.notes.length}개 노트</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.notes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                노트 ({searchResults.notes.length})
              </h2>
              <div className="space-y-3">
                {searchResults.notes.map((note) => (
                  <Card
                    key={`${note.bookId}-${note.id}`}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-secondary hover:border-accent bg-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5"
                    onClick={() => handleNoteClick(note)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-foreground">{highlightText(note.title, searchQuery)}</h3>
                          <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                            {note.bookTitle}
                          </Badge>
                        </div>

                        <p className="text-cool text-sm line-clamp-2">{highlightText(note.content, searchQuery)}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-accent" />
                            <div className="flex gap-1">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-accent/30 text-accent">
                                  {highlightText(tag, searchQuery)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-cool">
                            <Clock className="h-3 w-3" />
                            <span>{note.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.books.length === 0 && searchResults.notes.length === 0 && (
            <Card className="border-secondary bg-card">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-accent mx-auto mb-4" />
                <p className="text-foreground mb-2">검색 결과가 없습니다</p>
                <p className="text-sm text-cool">다른 키워드로 검색해보세요</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <Card className="border-secondary bg-card">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-accent mx-auto mb-4" />
            <p className="text-foreground mb-2">검색어를 입력해주세요</p>
            <p className="text-sm text-cool">책 제목, 저자, 노트 내용, 태그를 검색할 수 있습니다</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
