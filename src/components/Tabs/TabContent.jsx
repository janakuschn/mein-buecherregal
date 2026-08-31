// ZIEL-PFAD: src/components/Tabs/TabContent.jsx
import React, { useState, useMemo } from 'react'
import BookGrid from '../Books/BookGrid'
import BookModal from '../Books/BookModal'
import { RATING_IMAGES } from '../Books/StarRating'
import { useBooks } from '../../hooks/useBooks'
import { groupBooksByYear, getMonthName } from '../../utils/groupBooks'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function TabContent({
  tab,
  showRatings,
  selectedBook,
  onSelectBook,
  onAddRequest,
  onCloseModal,
}) {
  const { books, loading, error, createBook, editBook, removeBook, reorderBooks } = useBooks()
  const [ungelesenFilter, setUngelesenFilter] = useState('alle') // 'alle' | 'wunsch'
  const [ratingFilter, setRatingFilter] = useState(null) // null | 1-5
  const [audiobookFilter, setAudiobookFilter] = useState(null) // null = alle, false = ohne Hörbücher
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false) // false = Jahresansicht, true = Monatsansicht

  const filteredBooks = useMemo(() => {
    if (tab === 'aktuell') return books.filter((b) => b.status === 'aktuell')
    if (tab === 'gelesen') {
      let gelesen = books.filter((b) => b.status === 'gelesen')
      if (ratingFilter !== null) {
        gelesen = gelesen.filter((b) => b.rating === ratingFilter)
      }
      if (audiobookFilter === false) {
        gelesen = gelesen.filter((b) => !b.is_audiobook)
      }
      return gelesen
    }
    if (tab === 'ungelesen') {
      if (ungelesenFilter === 'wunsch') {
        return books.filter((b) => b.status === 'wunsch')
      }
      return books.filter((b) => b.status === 'ungelesen' || b.status === 'wunsch')
    }
    return []
  }, [books, tab, ungelesenFilter, ratingFilter, audiobookFilter])

  if (loading) return <LoadingSpinner />
  if (error) return <p className="error-state">Fehler beim Laden: {error}</p>

  return (
    <div className="tab-content">
      {tab === 'ungelesen' && (
        <div className="sub-filter ungelesen-filter">
          <button
            className={`sub-filter-btn ${ungelesenFilter === 'alle' ? 'active' : ''}`}
            onClick={() => setUngelesenFilter('alle')}
          >
            Alle
          </button>
          <button
            className={`sub-filter-btn ${ungelesenFilter === 'wunsch' ? 'active' : ''}`}
            onClick={() => setUngelesenFilter('wunsch')}
          >
            Wunschliste
          </button>
        </div>
      )}

      {tab === 'gelesen' && (
        <>
          <div className="sub-filter rating-filter">
            <button
              className={`sub-filter-btn ${ratingFilter === null ? 'active' : ''}`}
              onClick={() => setRatingFilter(null)}
            >
              Alle
            </button>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                className={`rating-filter-btn ${ratingFilter === r ? 'active' : ''}`}
                onClick={() => setRatingFilter(r)}
                title={`Nur Bewertung ${r}`}
              >
                <img src={RATING_IMAGES[r - 1]} alt={`Bewertung ${r}`} className="rating-filter-icon" />
              </button>
            ))}
          </div>

          <div className="sub-filter toggle-filter-row">
            <button
              className={`toggle-filter-btn ${audiobookFilter === false ? 'active' : ''}`}
              onClick={() => setAudiobookFilter(audiobookFilter === false ? null : false)}
            >
              Hörbücher
            </button>
            <button
              className={`toggle-filter-btn ${showMonthlyBreakdown ? 'active' : ''}`}
              onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
            >
              Monatsansicht
            </button>
          </div>
        </>
      )}

      {tab === 'gelesen' ? (
        <GelesenView
          books={filteredBooks}
          onBookClick={onSelectBook}
          showRatings={showRatings}
          filterActive={ratingFilter !== null}
          showMonthlyBreakdown={showMonthlyBreakdown}
        />
      ) : (
        <BookGrid
          books={filteredBooks}
          onBookClick={onSelectBook}
          showProgress={tab === 'aktuell'}
          sortable={tab === 'aktuell' || tab === 'ungelesen'}
          onReorder={reorderBooks}
        />
      )}

      <button className="fab-add" onClick={onAddRequest} aria-label="Buch hinzufügen">
        +
      </button>

      {selectedBook !== null && (
        <BookModal
          book={selectedBook === 'new' ? null : selectedBook}
          onClose={onCloseModal}
          onSave={async (data) => {
            if (selectedBook === 'new') {
              await createBook(data)
            } else {
              await editBook(selectedBook.id, data)
            }
            onCloseModal()
          }}
          onDelete={
            selectedBook !== 'new'
              ? async () => {
                  await removeBook(selectedBook.id)
                  onCloseModal()
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

function GelesenView({ books, onBookClick, showRatings, filterActive, showMonthlyBreakdown }) {
  const grouped = groupBooksByYear(books)
  const years = Object.keys(grouped).sort((a, b) => b - a)

  if (years.length === 0) {
    return (
      <p className="empty-state">
        {filterActive
          ? 'Keine gelesenen Bücher mit dieser Bewertung.'
          : 'Noch keine gelesenen Bücher.'}
      </p>
    )
  }

  // Jahresansicht (default): Bücher pro Jahr in einem Grid, nach Monat absteigend sortiert
  if (!showMonthlyBreakdown) {
    return (
      <div>
        {years.map((year) => {
          const monthKeys = Object.keys(grouped[year]).sort((a, b) => b - a)
          const booksForYear = monthKeys.flatMap((month) => grouped[year][month])
          return (
            <section key={year} className="year-section">
              <h2 className="year-header">{year}</h2>
              <BookGrid
                books={booksForYear}
                onBookClick={onBookClick}
                showRatings={showRatings}
                sortable={false}
              />
            </section>
          )
        })}
      </div>
    )
  }

  // Monatsansicht: wie bisher mit Monatsgruppen
  return (
    <div>
      {years.map((year) => (
        <section key={year} className="year-section">
          <h2 className="year-header">{year}</h2>
          {Object.keys(grouped[year])
            .sort((a, b) => b - a)
            .map((month) => (
              <div key={`${year}-${month}`}>
                <h3 className="month-header">{getMonthName(month)}</h3>
                <BookGrid
                  books={grouped[year][month]}
                  onBookClick={onBookClick}
                  showRatings={showRatings}
                  sortable={false}
                />
              </div>
            ))}
        </section>
      ))}
    </div>
  )
}
