// ZIEL-PFAD: src/services/openlibrary.js

export async function lookupByISBN(isbn) {
  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '')
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`

  const response = await fetch(url)
  if (!response.ok) throw new Error('OpenLibrary Anfrage fehlgeschlagen')

  const data = await response.json()
  const key = `ISBN:${cleanIsbn}`
  const book = data[key]

  if (!book) {
    throw new Error('Buch nicht gefunden. Bitte Titel/Autor manuell eingeben.')
  }

  return {
    isbn: cleanIsbn,
    title: book.title || '',
    author: (book.authors || []).map((a) => a.name).join(', '),
    cover_url:
      book.cover?.large ||
      book.cover?.medium ||
      `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
  }
}