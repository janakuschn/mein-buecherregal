// ZIEL-PFAD: src/components/Books/BookCard.jsx
//
// Der Thalia-Link (per Gedrückthalten + eigenem Teilen-Menü) hat sich in
// der Praxis nicht zuverlässig angefühlt und wurde wieder entfernt. Der
// Thalia-Link lebt jetzt stattdessen in der Detailansicht (BookModal.jsx):
// Klick aufs Cover dort fragt einfach nach, bevor es zu Thalia weitergeht -
// deutlich robuster als ein selbstgebautes Long-Press-Menü.
import React from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function BookCard({ book, onClick, showRatings, showProgress, dragHandleProps }) {
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !book.cover_url || imgError
  const isLent = !!book.lent_to
  const isAudiobook = !!book.is_audiobook

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
        {isAudiobook && <div className="book-audiobook-overlay"></div>}
        {isAudiobook && (
          <div className="book-audiobook-badge" title="Hörbuch">
            🎧
          </div>
        )}
        {dragHandleProps && (
          // Nur dieser Bereich (unsichtbar, unten rechts auf dem Cover)
          // startet das Verschieben (dnd-kit attributes/listeners landen
          // ausschließlich hier). stopPropagation verhindert, dass ein
          // kurzes Antippen zusätzlich die Detailansicht öffnet.
          <span
            className="book-drag-handle"
            role="button"
            aria-label="Ziehen zum Sortieren"
            onClick={(e) => e.stopPropagation()}
            {...dragHandleProps}
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
