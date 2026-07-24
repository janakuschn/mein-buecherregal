// ZIEL-PFAD: src/components/Books/BookCard.jsx
import React from 'react'
import StarRating from './StarRating'

const FALLBACK_COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">
  <rect width="200" height="300" fill="#e8ddd4"/>
  <text x="50%" y="50%" font-size="16" text-anchor="middle" fill="#a8897a" font-family="sans-serif">Kein Cover</text>
</svg>
`)

export default function BookCard({ book, onClick }) {
  return (
    <div className="book-card" onClick={() => onClick(book)}>
      <div className="book-cover-wrapper">
        <img
          src={book.cover_url || FALLBACK_COVER}
          alt={book.title}
          className="book-cover"
          onError={(e) => {
            e.target.src = FALLBACK_COVER
          }}
        />
      </div>
      <StarRating rating={book.rating || 0} readOnly size="small" />
    </div>
  )
}
