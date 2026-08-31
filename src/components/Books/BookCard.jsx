// ZIEL-PFAD: src/components/Books/BookCard.jsx
import React, { useRef, useState } from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'
import ShareActionSheet from './ShareActionSheet'
import { isRealIsbn, thaliaUrlForIsbn } from '../../utils/thalia'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

// Wie lange gedrückt halten, bis das Teilen-Menü erscheint, und wie viel
// Fingerbewegung währenddessen toleriert wird (mehr = Nutzer scrollt/wollte
// nicht lange drücken, Timer wird abgebrochen).
const LONG_PRESS_MS = 550
const MOVE_CANCEL_PX = 10

export default function BookCard({ book, onClick, showRatings, showProgress, dragHandleProps }) {
  const [imgError, setImgError] = React.useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const showFallback = !book.cover_url || imgError
  const isLent = !!book.lent_to
  const isAudiobook = !!book.is_audiobook

  // Eigenes Long-Press-Menü statt des nativen Link-Kontextmenüs: das
  // funktioniert im installierten Homescreen-App-Modus nicht zuverlässig
  // (bekannte iOS-Einschränkung). Nur Bücher mit einer echten ISBN
  // (nicht der "manual-..."-Platzhalter für nicht gefundene Bücher)
  // bekommen die Funktion.
  const hasThaliaLink = isRealIsbn(book.isbn)
  const thaliaUrl = hasThaliaLink ? thaliaUrlForIsbn(book.isbn) : null

  const longPressTimer = useRef(null)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const longPressTriggered = useRef(false)

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchStart = (e) => {
    if (!hasThaliaLink) return
    // Berührungen im (unsichtbaren) Ziehpunkt unten rechts sollen nur das
    // Sortieren auslösen, nicht zusätzlich das Teilen-Menü.
    if (e.target.closest('.book-drag-handle')) return
    longPressTriggered.current = false
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      setShowShareSheet(true)
    }, LONG_PRESS_MS)
  }

  const handleTouchMove = (e) => {
    if (!longPressTimer.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearLongPressTimer()
  }

  const handleTouchEnd = () => {
    clearLongPressTimer()
  }

  const handleCardClick = () => {
    // Das Teilen-Menü hat sich bereits per Long-Press geöffnet - der
    // abschließende "Klick" beim Loslassen des Fingers soll dann nicht
    // zusätzlich die Detailansicht öffnen.
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    onClick(book)
  }

  const handleShare = async () => {
    setShowShareSheet(false)
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, url: thaliaUrl })
      } catch {
        // Nutzer hat den Teilen-Dialog abgebrochen - kein Fehler nötig
      }
    } else {
      window.open(thaliaUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOpenThalia = () => {
    setShowShareSheet(false)
    window.open(thaliaUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="book-card"
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
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

      {showShareSheet && (
        <ShareActionSheet
          title={book.title}
          onShare={handleShare}
          onOpenThalia={handleOpenThalia}
          onCancel={(e) => {
            // Verhindert, dass ein Klick auf den abgedunkelten Hintergrund
            // (schließt das Menü) zur Elternkarte durchreicht und
            // zusätzlich die Detailansicht öffnet.
            e.stopPropagation()
            setShowShareSheet(false)
          }}
        />
      )}
    </div>
  )
}
