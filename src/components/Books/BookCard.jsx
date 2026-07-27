// ZIEL-PFAD: src/components/Books/BookCard.jsx
import React from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function BookCard({ book, onClick, showRatings, showProgress }) {
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !book.cover_url || imgError

  return (
    <div className="book-card" onClick={() => onClick(book)}>
      <div className="book-cover-wrapper">
        {showFallback ? (
          <div className="book-cover-placeholder">
            <img src={heartIcon} alt={book.title} className="book-cover-placeholder-icon" />
          </div>
        ) : (
          <img
            src={book.cover_url}
            alt={book.title}
            className="book-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {showProgress && book.progress > 0 && (
        <div className="book-progress-track">
          <div className="book-progress-fill" style={{ width: `${book.progress}%` }} />
        </div>
      )}
      {showRatings && <StarRating rating={book.rating || 0} readOnly size="small" />}
    </div>
  )
}
