// ZIEL-PFAD: src/components/Layout/DashboardModal.jsx  (NEUE Datei)
//
// Erreichbar über das Herz im Header (auf Aktuell/Ungelesen, wo es vorher
// funktionslos war) und zusätzlich über "Statistiken" im Footer (von
// überall, auch vom Tab Gelesen aus). Holt sich die Bücher unabhängig von
// TabContent noch einmal selbst (eigener useBooks()-Aufruf), damit an der
// bestehenden Datenlogik nichts geändert werden musste.
//
// Enthält zusätzlich den einmaligen Nachlade-Vorgang für Seitenzahl und
// Klappentext bei bereits vorhandenen Büchern (siehe openlibrary.js /
// hyper-processor Edge Function). Idempotent: überspringt Bücher, die
// schon Seitenzahl UND Klappentext haben - kann also gefahrlos mehrfach
// angestoßen werden, z.B. für Bücher, die beim letzten Mal fehlgeschlagen
// sind.
import React, { useState, useMemo, useEffect } from 'react'
import { useBooks } from '../../hooks/useBooks'
import { lookupByISBN } from '../../services/openlibrary'
import { isRealIsbn } from '../../utils/thalia'
import { RATING_IMAGES } from '../Books/StarRating'
import LoadingSpinner from '../Common/LoadingSpinner'

const currentYear = new Date().getFullYear()

// Absichtlich AUSSERHALB der Komponente (Modul-Zustand, kein React State):
// Schließt man das Dashboard während des Nachladens und öffnet es neu,
// wird die Komponente neu gemountet - ein normaler useState wäre dann
// wieder leer und "Jetzt nachladen" hätte erneut geklickt werden können,
// während im Hintergrund noch ein Lauf lief. Das führte dazu, dass es aussah,
// als würde der Vorgang "immer wieder von vorne starten" (tatsächlich liefen
// dann zwei Läufe gleichzeitig und haben sich gegenseitig das ohnehin knappe
// Google-Books-Rate-Limit weggenommen). Dieses Objekt lebt so lange wie der
// Tab offen ist, unabhängig davon, ob das Dashboard gerade angezeigt wird.
let globalBackfill = { status: 'idle', done: 0, total: 0, updated: 0, skipped: 0, failed: 0 }

async function runBackfillOnce(candidates, editBook) {
  if (globalBackfill.status === 'running') return // läuft schon, keinen zweiten Lauf starten
  globalBackfill = { status: 'running', done: 0, total: candidates.length, updated: 0, skipped: 0, failed: 0 }
  for (const book of candidates) {
    try {
      const result = await lookupByISBN(book.isbn)
      if (result.pageCount || result.description) {
        await editBook(book.id, {
          page_count: result.pageCount || book.page_count || null,
          description: result.description || book.description || null,
        })
        globalBackfill = { ...globalBackfill, done: globalBackfill.done + 1, updated: globalBackfill.updated + 1 }
      } else {
        globalBackfill = { ...globalBackfill, done: globalBackfill.done + 1, skipped: globalBackfill.skipped + 1 }
      }
    } catch {
      globalBackfill = { ...globalBackfill, done: globalBackfill.done + 1, failed: globalBackfill.failed + 1 }
    }
    // Deutlich größere Pause zwischen den Anfragen als zuerst versucht
    // (700ms): Google Books hat ohne API-Key ein recht niedriges
    // Rate-Limit - beim ersten Testlauf wurden nach den ersten paar
    // Büchern fast alle weiteren als "ohne Treffer" abgewiesen, weil
    // Google Books zu schnell hintereinander angefragt wurde.
    await new Promise((r) => setTimeout(r, 1500))
  }
  globalBackfill = { ...globalBackfill, status: 'done' }
}

export default function DashboardModal({ onClose }) {
  const { books, loading, editBook } = useBooks()
  const [backfillState, setBackfillState] = useState(globalBackfill)

  // Synchronisiert die Anzeige mit dem modulweiten Zustand - läuft ein
  // Nachladen bereits im Hintergrund (aus einem vorherigen Öffnen), zeigt
  // sich das hier sofort als laufender Fortschritt statt eines leeren
  // "Jetzt nachladen"-Buttons.
  useEffect(() => {
    const interval = setInterval(() => {
      setBackfillState((prev) =>
        prev.done === globalBackfill.done && prev.status === globalBackfill.status
          ? prev
          : { ...globalBackfill }
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const candidates = useMemo(
    () => books.filter((b) => isRealIsbn(b.isbn) && (!b.page_count || !b.description)),
    [books]
  )

  const runBackfill = () => {
    runBackfillOnce(candidates, editBook)
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-shell dashboard-shell" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
          <div className="modal-content">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  const aktuellCount = books.filter((b) => b.status === 'aktuell').length
  const ungelesenCount = books.filter((b) => b.status === 'ungelesen' || b.status === 'wunsch').length
  const gelesenThisYear = books.filter((b) => b.status === 'gelesen' && b.completed_year === currentYear)
  const totalCount = books.length

  const ratingCounts = [1, 2, 3, 4, 5].map((r) => gelesenThisYear.filter((b) => b.rating === r).length)
  const maxRatingCount = Math.max(1, ...ratingCounts)

  const recentlyFinished = books
    .filter((b) => b.status === 'gelesen')
    .sort((a, b) => {
      const aKey = (a.completed_year || 0) * 100 + (a.completed_month || 0)
      const bKey = (b.completed_year || 0) * 100 + (b.completed_month || 0)
      if (aKey !== bKey) return bKey - aKey
      return new Date(b.created_at) - new Date(a.created_at)
    })
    .slice(0, 4)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-shell dashboard-shell" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>

        <div className="modal-content">
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-value">{aktuellCount}</div>
              <div className="dashboard-stat-label">Aktuell</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-value">{ungelesenCount}</div>
              <div className="dashboard-stat-label">Ungelesen</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-value">{gelesenThisYear.length}</div>
              <div className="dashboard-stat-label">Gelesen {currentYear}</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-value">{totalCount}</div>
              <div className="dashboard-stat-label">Bücher insgesamt</div>
            </div>
          </div>

          <div className="dashboard-section">
            <p className="dashboard-section-title">Bewertungen {currentYear}</p>
            <div className="dashboard-rating-bars">
              {ratingCounts.map((count, i) => (
                <div key={i} className="dashboard-rating-bar-wrapper">
                  <div
                    className="dashboard-rating-bar"
                    style={{ height: `${(count / maxRatingCount) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="dashboard-rating-labels">
              {[1, 2, 3, 4, 5].map((r) => (
                <img
                  key={r}
                  src={RATING_IMAGES[r - 1]}
                  alt={`${r} von 5`}
                  className="dashboard-rating-icon"
                />
              ))}
            </div>
          </div>

          {recentlyFinished.length > 0 && (
            <div className="dashboard-section">
              <p className="dashboard-section-title">Zuletzt beendet</p>
              <div className="dashboard-recent-covers">
                {recentlyFinished.map((b) => (
                  <div key={b.id} className="dashboard-recent-cover">
                    {b.cover_url ? <img src={b.cover_url} alt={b.title} /> : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dashboard-section">
            <p className="dashboard-section-title">Buchdaten nachladen</p>
            {backfillState.status === 'running' ? (
              <p className="dashboard-backfill-status">
                {backfillState.done} / {backfillState.total} verarbeitet... (läuft auch im
                Hintergrund weiter, wenn du das Fenster schließt)
              </p>
            ) : backfillState.status === 'done' ? (
              <p className="dashboard-backfill-status">
                Fertig: {backfillState.updated} aktualisiert, {backfillState.skipped} ohne Treffer,{' '}
                {backfillState.failed} fehlgeschlagen.
              </p>
            ) : (
              <>
                <p className="dashboard-backfill-hint">
                  Lädt Seitenzahl und Klappentext für Bücher nach, bei denen das noch fehlt.
                </p>
                <button className="btn-secondary" onClick={runBackfill} disabled={candidates.length === 0}>
                  {candidates.length === 0
                    ? 'Alle Bücher haben schon Daten'
                    : `Jetzt nachladen (${candidates.length})`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
