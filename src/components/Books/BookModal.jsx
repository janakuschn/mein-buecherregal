// ZIEL-PFAD: src/components/Books/BookModal.jsx
import React, { useState, useEffect } from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import BarcodeScanner from '../Scanner/BarcodeScanner'
import { lookupByISBN, lookupByText } from '../../services/openlibrary'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'
import { isRealIsbn, thaliaUrlForIsbn } from '../../utils/thalia'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_OPTIONS = [
  { id: 'aktuell', label: 'Aktuell' },
  { id: 'gelesen', label: 'Gelesen' },
  { id: 'ungelesen', label: 'Ungelesen' },
  { id: 'wunsch', label: 'Wunsch' },
]

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i)

export default function BookModal({ book, onClose, onSave, onDelete }) {
  const isNew = !book

  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [isbn, setIsbn] = useState(book?.isbn || '')
  const [coverUrl, setCoverUrl] = useState(book?.cover_url || '')
  // Manche Cover-URLs sind zwar gesetzt, laden aber nicht (kaputter Link,
  // fehlgeschlagener Upload im Hintergrund usw.). Ohne diese Prüfung würde
  // der Browser nur ein kaputtes Bild-Icon zeigen statt auf den
  // Herz-Platzhalter zurückzufallen. Setzt sich bei jeder neuen coverUrl
  // (z.B. nach erneuter Suche) automatisch zurück.
  const [coverLoadError, setCoverLoadError] = useState(false)
  useEffect(() => {
    setCoverLoadError(false)
  }, [coverUrl])
  const [rating, setRating] = useState(book?.rating || 0)
  const [notes, setNotes] = useState(book?.notes || '')
  const [status, setStatus] = useState(book?.status || 'ungelesen')
  const [progress, setProgress] = useState(book?.progress || 0)
  const [completedMonth, setCompletedMonth] = useState(
    book?.completed_month || new Date().getMonth() + 1
  )
  const [completedYear, setCompletedYear] = useState(book?.completed_year || currentYear)
  const [showScanner, setShowScanner] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Seitenzahl/Klappentext: kommen automatisch mit der ISBN-Suche mit
  // (siehe openlibrary.js/hyper-processor), rein informativ, keine
  // eigenen Eingabefelder.
  const [pageCount, setPageCount] = useState(book?.page_count || null)
  const [description, setDescription] = useState(book?.description || '')

  // Verleihen: solange nicht "Zurückbekommen" gedrückt wird, bleibt das
  // Buch als verliehen markiert (transparent + Schlaf-Herz-Badge).
  const [lentTo, setLentTo] = useState(book?.lent_to || '')
  const [lentSince, setLentSince] = useState(book?.lent_since || '')
  const [showLendForm, setShowLendForm] = useState(false)
  const [lendFormName, setLendFormName] = useState('')
  const [lendFormDate, setLendFormDate] = useState(todayIsoDate())
  const isLent = !!lentTo

  // Hörbuch: Toggle-State, wird mit handleSave in die DB gespeichert
  const [isAudiobook, setIsAudiobook] = useState(book?.is_audiobook || false)

  const openLendForm = () => {
    setLendFormName('')
    setLendFormDate(todayIsoDate())
    setShowLendForm(true)
  }

  const confirmLend = () => {
    if (!lendFormName.trim()) return
    setLentTo(lendFormName.trim())
    setLentSince(lendFormDate)
    setShowLendForm(false)
  }

  const handleReturn = () => {
    setLentTo('')
    setLentSince('')
  }

  // Erkennt selbst, ob im Suchfeld eine ISBN (nur Ziffern/X, 10 oder 13
  // Zeichen) oder ein Titel steht, und ruft die passende Suche auf. So
  // reicht ein einziges Feld für beides.
  const looksLikeIsbn = (value) => {
    const cleaned = value.replace(/[^0-9Xx]/g, '')
    return cleaned.length === 10 || cleaned.length === 13
  }

  const handleSearch = async (scannedIsbn) => {
    const query = scannedIsbn || isbn
    if (!query.trim()) return
    setShowScanner(false)
    setLookupLoading(true)
    setLookupError('')
    try {
      const result = scannedIsbn || looksLikeIsbn(query)
        ? await lookupByISBN(query)
        : await lookupByText(query)
      setIsbn(result.isbn)
      setTitle(result.title)
      setAuthor(result.author)
      setCoverUrl(result.cover_url)
      setPageCount(result.pageCount || null)
      setDescription(result.description || '')
    } catch (err) {
      setLookupError(err.message)
      if (scannedIsbn) setIsbn(scannedIsbn)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Bitte einen Titel eingeben.')
      return
    }
    setSaving(true)
    setSaveError('')
    const data = {
      title: title.trim(),
      author: author.trim() || null,
      isbn: isbn.trim() || `manual-${Date.now()}`,
      cover_url: coverUrl || null,
      rating: rating || null,
      notes: notes.trim() || null,
      status,
      progress: Number(progress) || 0,
      completed_month: status === 'gelesen' ? Number(completedMonth) : null,
      completed_year: status === 'gelesen' ? Number(completedYear) : null,
      lent_to: lentTo.trim() || null,
      lent_since: lentTo.trim() ? lentSince || todayIsoDate() : null,
      is_audiobook: isAudiobook,
      page_count: pageCount || null,
      description: description.trim() || null,
    }
    try {
      await onSave(data)
    } catch (err) {
      console.error('[Speichern] Fehler:', err)
      if (err?.code === '23505') {
        setSaveError('Dieses Buch (ISBN) ist bereits in deiner Bibliothek vorhanden.')
      } else if (err?.message?.toLowerCase().includes('schema cache')) {
        setSaveError(
          'Datenbank ist noch nicht aktuell: Bitte zuerst "add_lent_columns.sql" im Supabase SQL Editor ausführen (fügt lent_to/lent_since zur Tabelle "books" hinzu).'
        )
      } else {
        setSaveError(err?.message || 'Speichern fehlgeschlagen. Bitte versuche es erneut.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    if (window.confirm(`"${title || 'Dieses Buch'}" wirklich unwiderruflich löschen?`)) {
      onDelete()
    }
  }

  // Klick aufs Cover in der Detailansicht: fragt nach, ob es zu Thalia
  // weitergehen soll (statt des vorherigen Gedrückthalten-Menüs auf den
  // Buchcovern in der Übersicht, das nicht zuverlässig funktioniert hat).
  // Nur bei Büchern mit echter ISBN (kein "manual-..."-Platzhalter).
  // Statt window.confirm() (sieht auf iOS wie eine Systemwarnung aus und
  // lässt sich nicht stylen) ein eigenes Modal im App-Design.
  const hasThaliaLink = isRealIsbn(isbn)
  const [showThaliaConfirm, setShowThaliaConfirm] = useState(false)

  const handleCoverClick = () => {
    if (!hasThaliaLink) return
    setShowThaliaConfirm(true)
  }

  const confirmThalia = () => {
    window.open(thaliaUrlForIsbn(isbn), '_blank', 'noopener,noreferrer')
    setShowThaliaConfirm(false)
  }

  const cancelThalia = () => setShowThaliaConfirm(false)

  // Kein expliziter Speichern-Button mehr: Schließen (X oder Klick auf den
  // abgedunkelten Hintergrund) speichert automatisch. Ausnahme: ein neu
  // angelegtes Buch ohne Titel wird verworfen statt mit einem leeren Titel
  // gespeichert zu werden. onSave() (siehe TabContent.jsx) schließt das
  // Modal bei Erfolg bereits selbst - bei einem Fehler (z.B. doppelte ISBN)
  // bleibt es bewusst offen, damit die Fehlermeldung sichtbar bleibt.
  const closeAndSave = async () => {
    if (!title.trim()) {
      onClose()
      return
    }
    await handleSave()
  }

  return (
    <>
    <div className="modal-overlay" onClick={closeAndSave}>
      <div className="modal-shell" onClick={(e) => e.stopPropagation()}>
        {/* Haken liegt außerhalb des scrollenden Bereichs (.modal-content),
            damit er beim Scrollen in der Detailansicht sichtbar bleibt statt
            mit dem Inhalt nach oben wegzuscrollen. */}
        <button className="modal-done-btn" onClick={closeAndSave} aria-label="Fertig, speichert und schließt">
          ✓
        </button>

        <div className="modal-content">
        {showScanner && (
          <BarcodeScanner onDetected={handleSearch} onClose={() => setShowScanner(false)} />
        )}

        <div className="modal-top-panel">
          <div
            className={`modal-cover-wrapper ${isLent ? 'modal-cover-wrapper-lent' : ''} ${hasThaliaLink ? 'modal-cover-wrapper-linked' : ''}`}
            onClick={handleCoverClick}
          >
            {coverUrl && !coverLoadError ? (
              <img
                src={coverUrl}
                alt={title}
                className="modal-cover"
                onError={() => setCoverLoadError(true)}
              />
            ) : (
              <div className="modal-cover-placeholder">
                <img src={heartIcon} alt="Kein Cover" className="modal-cover-placeholder-icon" />
                <p className="modal-cover-placeholder-title">{title}</p>
              </div>
            )}
            {isLent && (
              <img src={sleepingHeart} alt="Verliehen" className="modal-lent-badge" />
            )}
          </div>

          <StarRating rating={rating} onChange={setRating} />
        </div>

        {/* Seitenzahl/Klappentext - nur wenn vorhanden (ältere Bücher haben
            das ggf. noch nicht, siehe Dashboard "Buchdaten nachladen"). */}
        {(pageCount || description) && (
          <div className="book-info-section">
            {pageCount && <p className="book-info-pages">{pageCount} Seiten</p>}
            {description && <p className="book-info-description">{description}</p>}
          </div>
        )}

        {/* Titel/Autor/ISBN-Suche liegen bewusst außerhalb des Headers oben
            (der zeigt nur noch Cover + Bewertung), aber weiterhin ganz oben
            im Inhalt, direkt unter dem Header. */}
        {isNew && (
          <div className="isbn-lookup-row">
            <input
              type="text"
              placeholder="ISBN oder Titel eingeben"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
            <button className="btn-secondary" onClick={() => handleSearch()} disabled={lookupLoading}>
              {lookupLoading ? 'Suche...' : 'Suchen'}
            </button>
            <button className="btn-secondary" onClick={() => setShowScanner(true)} title="Barcode scannen">
              📷 Scannen
            </button>
          </div>
        )}
        {lookupError && <p className="auth-error">{lookupError}</p>}

        <div className="status-tags">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`status-tag ${status === opt.id ? 'status-tag-active' : ''}`}
              onClick={() => setStatus(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {status === 'aktuell' && (
          <div className="modal-progress">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="progress-slider"
              style={{ '--progress-fill': `${progress}%` }}
              aria-label={`Fortschritt: ${progress}%`}
            />
          </div>
        )}

        {status === 'gelesen' && (
          <div className="date-selects">
            <div>
              <label>Month</label>
              <select value={completedMonth} onChange={(e) => setCompletedMonth(e.target.value)}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Year</label>
              <select value={completedYear} onChange={(e) => setCompletedYear(e.target.value)}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <textarea
          className="modal-notes"
          placeholder="Notes & Thoughts..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Hörbuch und Verleihen nebeneinander, solange Verleihen nur ein
            Button ist. Sobald verliehen wird bzw. das Formular offen ist,
            braucht der Verleihen-Status die volle Breite und rutscht als
            eigener Block darunter (siehe .lend-section-expanded). */}
        <div className="secondary-actions-row">
          <button
            className={`status-tag ${isAudiobook ? 'status-tag-active' : ''}`}
            onClick={() => setIsAudiobook(!isAudiobook)}
          >
            {isAudiobook ? '🎧 Hörbuch (aktiv)' : '🎧 Hörbuch'}
          </button>

          {!isLent && !showLendForm && (
            <button className="status-tag" onClick={openLendForm}>
              📖 Verleihen
            </button>
          )}
        </div>

        {(isLent || showLendForm) && (
          <div className="lend-section-expanded">
            {isLent ? (
              <div className="lend-status">
                <span>
                  📖 Verliehen an <strong>{lentTo}</strong> seit{' '}
                  {lentSince
                    ? new Date(lentSince).toLocaleDateString('de-DE')
                    : ''}
                </span>
                <button className="btn-secondary" onClick={handleReturn}>
                  Zurückbekommen
                </button>
              </div>
            ) : (
              <div className="lend-form">
                <div className="lend-form-row">
                  <input
                    className="lend-form-name"
                    type="text"
                    placeholder="An wen?"
                    value={lendFormName}
                    onChange={(e) => setLendFormName(e.target.value)}
                  />
                  <input
                    className="lend-form-date"
                    type="date"
                    value={lendFormDate}
                    onChange={(e) => setLendFormDate(e.target.value)}
                  />
                </div>
                <div className="lend-form-actions">
                  <button className="btn-primary" onClick={confirmLend} disabled={!lendFormName.trim()}>
                    Verleihen bestätigen
                  </button>
                  <button className="status-tag" onClick={() => setShowLendForm(false)}>
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {saveError && <p className="auth-error">{saveError}</p>}

        <div className="modal-actions">
          {saving && <span className="modal-saving-indicator">Speichert...</span>}
          {onDelete && (
            <button className="btn-danger" onClick={handleDeleteClick}>
              Löschen
            </button>
          )}
        </div>
        </div>
      </div>
    </div>

    {showThaliaConfirm && (
      <div className="thalia-confirm-overlay" onClick={cancelThalia}>
        <div className="thalia-confirm-box" onClick={(e) => e.stopPropagation()}>
          <div className="thalia-confirm-actions">
            <button className="btn-secondary" onClick={cancelThalia}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={confirmThalia}>
              Zu Thalia
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
