// ZIEL-PFAD: src/hooks/useBooks.js
import { useState, useEffect, useCallback } from 'react'
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBook,
  reorderBooks as persistReorder,
} from '../services/bookService'

// Gleiche Sortierlogik wie die Datenbank-Abfrage in fetchBooks() (sort_order
// aufsteigend, ohne Wert zuletzt; bei Gleichstand neuestes Erstelldatum
// zuerst). Wird nach dem lokalen Reorder-Update angewendet, damit die
// Reihenfolge auf dem Bildschirm SOFORT stimmt - ohne Neuladen der Seite.
function compareBooks(a, b) {
  const aHasOrder = a.sort_order !== null && a.sort_order !== undefined
  const bHasOrder = b.sort_order !== null && b.sort_order !== undefined
  if (aHasOrder && bHasOrder && a.sort_order !== b.sort_order) {
    return a.sort_order - b.sort_order
  }
  if (aHasOrder !== bHasOrder) {
    return aHasOrder ? -1 : 1
  }
  return new Date(b.created_at) - new Date(a.created_at)
}

export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBooks()
      setBooks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const createBook = async (book) => {
    const sameStatus = books.filter((b) => b.status === book.status)
    const minOrder =
      sameStatus.length > 0 ? Math.min(...sameStatus.map((b) => b.sort_order ?? 0)) : 1
    const newBook = await addBook({ ...book, sort_order: minOrder - 1 })
    setBooks((prev) => [newBook, ...prev])
    return newBook
  }

  const editBook = async (id, updates) => {
    const updated = await updateBook(id, updates)
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
    return updated
  }

  const removeBook = async (id) => {
    await deleteBook(id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  // reorderedGroup: die Bücher EINER Gruppe (z.B. alle "Aktuell"-Bücher, oder
  // alle Bücher eines Monats bei Gelesen) in ihrer neuen, gewünschten
  // Reihenfolge. Es werden nur die bereits in dieser Gruppe vorhandenen
  // sort_order-Werte neu verteilt - das beeinflusst nie Bücher außerhalb
  // dieser Gruppe.
  const reorderBooks = async (reorderedGroup) => {
    const existingValues = reorderedGroup
      .map((b) => b.sort_order)
      .filter((v) => v !== null && v !== undefined)

    const values =
      existingValues.length === reorderedGroup.length
        ? [...existingValues].sort((a, b) => a - b)
        : reorderedGroup.map((_, i) => i)

    const updates = reorderedGroup.map((book, i) => ({ id: book.id, sort_order: values[i] }))
    const updateMap = new Map(updates.map((u) => [u.id, u.sort_order]))

    // Sofort im UI-State neu sortieren (nicht nur den sort_order-Wert
    // ändern) - sonst bleibt die alte Reihenfolge auf dem Bildschirm
    // stehen, bis die Seite neu geladen wird und die Bücher neu vom
    // Server (schon korrekt sortiert) geholt werden.
    setBooks((prev) => {
      const next = prev.map((b) => (updateMap.has(b.id) ? { ...b, sort_order: updateMap.get(b.id) } : b))
      return next.sort(compareBooks)
    })

    try {
      await persistReorder(updates)
    } catch (err) {
      // Server-Update fehlgeschlagen: lokale Reihenfolge zurücksetzen,
      // damit UI und Datenbank nicht dauerhaft auseinanderlaufen.
      await loadBooks()
      throw err
    }
  }

  return { books, loading, error, createBook, editBook, removeBook, reorderBooks, refetch: loadBooks }
}
