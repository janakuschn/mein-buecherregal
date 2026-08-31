// ZIEL-PFAD: src/components/Books/BookCard.jsx
import React from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'
import { isRealIsbn, thaliaUrlForIsbn } from '../../utils/thalia'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function BookCard({ book, onClick, showRatings, showProgress }) {
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !book.cover_url || imgError
  const isLent = !!book.lent_to
  const isAudiobook = !!book.is_audiobook

  // Echtes <a href> statt eines Klick-Handlers auf einem <div>: nur so
  // zeigt iOS Safari beim Gedrückthalten das native Teilen-Menü mit dem
  // Thalia-Link an. Ein normales Antippen öffnet trotzdem ganz normal die
  // Detailansicht (handleClick unten verhindert die Navigation zu Thalia).
  // Bücher ohne echte ISBN (manuell angelegt, Platzhalter "manual-...")
  // bekommen keinen Link, damit dort kein kaputter/irreführender Share
  // entsteht - für die bleibt es beim normalen <div>.
  const hasThaliaLink = isRealIsbn(book.isbn)

  const handleClick = (e) => {
    e.preventDefault()
    onClick(book)
  }

  const cardContent = (
    <>
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
      </div>
      {showProgress && book.progress > 0 && (
        <div className="book-progress-track">
          <div className="book-progress-fill" style={{ width: `${book.progress}%` }} />
        </div>
      )}
      {showRatings && <StarRating rating={book.rating || 0} readOnly size="small" />}
    </>
  )

  if (hasThaliaLink) {
    return (
      <a className="book-card" href={thaliaUrlForIsbn(book.isbn)} onClick={handleClick}>
        {cardContent}
      </a>
    )
  }

  return (
    <div className="book-card" onClick={() => onClick(book)}>
      {cardContent}
    </div>
  )
}
