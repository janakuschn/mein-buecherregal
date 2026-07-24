// ZIEL-PFAD: src/components/Tabs/TabContent.jsx
import React, { useState, useMemo } from 'react'
import BookGrid from '../Books/BookGrid'
import BookModal from '../Books/BookModal'
import { useBooks } from '../../hooks/useBooks'
import { groupBooksByYear, getMonthName } from '../../utils/groupBooks'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function TabContent({
  tab,
  wishlistOnly,
  selectedBook,
  onSelectBook,
  onAddRequest,
  onCloseModal,
}) {
  const { books, loading, error, createBook, editBook, removeBook } = useBooks()
  const [ungelesenFilter, setUngelesenFilter] = useState('alle') // 'alle' | 'wunsch'

  const filteredBooks = useMemo(() => {
    if (tab === 'aktuell') return books.filter((b) => b.status === 'aktuell')
    if (tab === 'gelesen') return books.filter((b) => b.status === 'gelesen')
    if (tab === 'ungelesen') {
      if (wishlistOnly || ungelesenFilter === 'wunsch') {
        return books.filter((b) => b.status === 'wunsch')
      }
      return books.filter((b) => b.status === 'ungelesen' || b.status === 'wunsch')
    }
    return []
  }, [books, tab, ungelesenFilter, wishlistOnly])

  if (loading) return <LoadingSpinner />
  if (error) return <p className="error-state">Fehler beim Laden: {error}</p>

  return (
    <div className="tab-content">
      {tab === 'ungelesen' && !wishlistOnly && (
        <div className="sub-filter">
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

      {tab === 'gelesen' ? (
        <GelesenView books={filteredBooks} onBookClick={onSelectBook} />
      ) : (
        <BookGrid books={filteredBooks} onBookClick={onSelectBook} />
      )}

      <button className="fab-add" onClick={onAddRequest}>
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

function GelesenView({ books, onBookClick }) {
  const grouped = groupBooksByYear(books)
  const years = Object.keys(grouped).sort((a, b) => b - a)

  if (years.length === 0) {
    return <p className="empty-state">Noch keine gelesenen Bücher.</p>
  }

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
                <BookGrid books={grouped[year][month]} onBookClick={onBookClick} />
              </div>
            ))}
        </section>
      ))}
    </div>
  )
}
