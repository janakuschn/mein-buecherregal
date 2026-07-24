// ZIEL-PFAD: src/components/Books/BookModal.jsx
import React, { useState } from 'react'
import StarRating from './StarRating'
import BarcodeScanner from '../Scanner/BarcodeScanner'
import { lookupByISBN } from '../../services/openlibrary'

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
  const [completedMonth, setCompletedMonth] = useState(
    book?.completed_month || new Date().getMonth() + 1
  )
  const [completedYear, setCompletedYear] = useState(book?.completed_year || currentYear)
  const [showScanner, setShowScanner] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Bitte einen Titel eingeben.')
      return
    }
    setSaving(true)
    const data = {
      title: title.trim(),
      author: author.trim() || null,
      isbn: isbn.trim() || `manual-${Date.now()}`,
      cover_url: coverUrl || null,
      rating: rating || null,
      notes: notes.trim() || null,
      status,
      completed_month: status === 'gelesen' ? Number(completedMonth) : null,
      completed_year: status === 'gelesen' ? Number(completedYear) : null,
    }
    try {
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {showScanner && (
          <BarcodeScanner onDetected={handleIsbnLookup} onClose={() => setShowScanner(false)} />
        )}

        <div className="modal-cover-wrapper">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="modal-cover" />
          ) : (
            <div className="modal-cover-placeholder">Kein Cover</div>
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
            <button className="btn-secondary" onClick={() => setShowScanner(true)}>
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

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
          {onDelete && (
            <button className="btn-danger" onClick={onDelete}>
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
