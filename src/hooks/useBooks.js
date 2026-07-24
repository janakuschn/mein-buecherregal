// ZIEL-PFAD: src/hooks/useBooks.js
import { useState, useEffect, useCallback } from 'react'
import { fetchBooks, addBook, updateBook, deleteBook } from '../services/bookService'

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
    const newBook = await addBook(book)
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

  return { books, loading, error, createBook, editBook, removeBook, refetch: loadBooks }
}