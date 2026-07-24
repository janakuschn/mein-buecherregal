// ZIEL-PFAD: src/components/Books/BookGrid.jsx
import React from 'react'
import BookCard from './BookCard'

export default function BookGrid({ books, onBookClick, showRatings }) {
  if (!books || books.length === 0) {
    return <p className="empty-state">Noch keine Bücher in dieser Ansicht.</p>
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={onBookClick} showRatings={showRatings} />
      ))}
    </div>
  )
}
