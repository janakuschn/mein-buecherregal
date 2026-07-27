// ZIEL-PFAD: src/components/Books/BookModal.jsx
import React, { useState } from 'react'
import StarRating, { RATING_IMAGES } from './StarRating'
import BarcodeScanner from '../Scanner/BarcodeScanner'
import { lookupByISBN, lookupByText } from '../../services/openlibrary'
import sleepingHeart from '../../assets/icons/sleeping-heart.png'

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

  // Verleihen: solange nicht "Zurückbekommen" gedrückt wird, bleibt das
  // Buch als verliehen markiert (transparent + Schlaf-Herz-Badge).
  const [lentTo, setLentTo] = useState(book?.lent_to || '')
  const [lentSince, setLentSince] = useState(book?.lent_since || '')
  const [showLendForm, setShowLendForm] = useState(false)
  const [lendFormName, setLendFormName] = useState('')
  const [lendFormDate, setLendFormDate] = useState(todayIsoDate())
  const isLent = !!lentTo

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

  const handleIsbnLookup = async (scannedIsbn) => {
    const code = scannedIsbn || isbn
    if (!code) return
    setShowScanner(false)
    setLookupLoading(true)
    setLookupError('')
    try {
      const result = await lookupByISBN(code)
      setIsbn(result.isbn)
      setTitle(result.title)
      setAuthor(result.author)
      setCoverUrl(result.cover_url)
    } catch (err) {
      setLookupError(err.message)
      setIsbn(code)
    } finally {
      setLookupLoading(false)
    }
  }

  // Wird aufgerufen, wenn beim Scannen kein Barcode gefunden wurde und
  // stattdessen der per Texterkennung gelesene Cover-Text zur Suche
  // verwendet wird.
  const handleTextLookup = async (recognizedText) => {
    setShowScanner(false)
    setLookupLoading(true)
    setLookupError('')
    try {
      const result = await lookupByText(recognizedText)
      setIsbn(result.isbn)
      setTitle(result.title)
      setAuthor(result.author)
      setCoverUrl(result.cover_url)
    } catch (err) {
      setLookupError(err.message)
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {showScanner && (
          <BarcodeScanner
            onDetected={handleIsbnLookup}
            onTextDetected={handleTextLookup}
            onClose={() => setShowScanner(false)}
          />
        )}

        <div className="modal-top-panel">
          <div className={`modal-cover-wrapper ${isLent ? 'modal-cover-wrapper-lent' : ''}`}>
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="modal-cover" />
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

          {isNew && (
            <div className="isbn-lookup-row">
              <input
                type="text"
                placeholder="ISBN eingeben"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
              <button className="btn-secondary" onClick={() => handleIsbnLookup()} disabled={lookupLoading}>
                {lookupLoading ? 'Suche...' : 'Suchen'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowScanner(true)}
                title="Erkennt automatisch Barcode oder Cover-Text"
              >
                📷 Scannen
              </button>
            </div>
          )}
          {lookupError && <p className="auth-error">{lookupError}</p>}

          <input
            className="modal-title-input"
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="modal-author-input"
            type="text"
            placeholder="Autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />

          <StarRating rating={rating} onChange={setRating} />
        </div>

        <textarea
          className="modal-notes"
          placeholder="Notes & Thoughts..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

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

        <div className="lend-section">
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
          ) : showLendForm ? (
            <div className="lend-form">
              <div className="lend-form-row">
                <input
                  type="text"
                  placeholder="An wen?"
                  value={lendFormName}
                  onChange={(e) => setLendFormName(e.target.value)}
                />
                <input
                  type="date"
                  value={lendFormDate}
                  onChange={(e) => setLendFormDate(e.target.value)}
                />
              </div>
              <div className="lend-form-actions">
                <button className="btn-primary" onClick={confirmLend} disabled={!lendFormName.trim()}>
                  Verleihen bestätigen
                </button>
                <button className="btn-secondary" onClick={() => setShowLendForm(false)}>
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-secondary" onClick={openLendForm}>
              📖 Verleihen
            </button>
          )}
        </div>

        {saveError && <p className="auth-error">{saveError}</p>}

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
          {onDelete && (
            <button className="btn-danger" onClick={handleDeleteClick}>
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
