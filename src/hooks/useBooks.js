// ZIEL-PFAD: src/hooks/useBooks.js
import { useState, useEffect, useCallback } from 'react'
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBook,
  reorderBooks as persistReorder,
} from '../services/bookService'

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

    setBooks((prev) => prev.map((b) => (updateMap.has(b.id) ? { ...b, sort_order: updateMap.get(b.id) } : b)))

    await persistReorder(updates)
  }

  return { books, loading, error, createBook, editBook, removeBook, reorderBooks, refetch: loadBooks }
}
