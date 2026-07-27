// ZIEL-PFAD: src/components/Books/BookCard.jsx
import React from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function BookCard({ book, onClick, showRatings, showProgress }) {
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !book.cover_url || imgError
  const isLent = !!book.lent_to

  return (
    <div className="book-card" onClick={() => onClick(book)}>
      <div className={`book-cover-wrapper ${isLent ? 'book-cover-wrapper-lent' : ''}`}>
        {showFallback ? (
          <div className="book-cover-placeholder">
            <img src={heartIcon} alt={book.title} className="book-cover-placeholder-icon" />
            <p className="book-cover-placeholder-title">{book.title}</p>
          </div>
        ) : (
          <img
            src={book.cover_url}
            alt={book.title}
            className="book-cover"
            onError={() => setImgError(true)}
          />
        )}
        {isLent && (
          <img src={sleepingHeart} alt="Verliehen" className="book-lent-badge" title={`Verliehen an ${book.lent_to}`} />
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
