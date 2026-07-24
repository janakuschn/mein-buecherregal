// ZIEL-PFAD: src/utils/groupBooks.js

export function groupBooksByYear(books) {
  return books.reduce((grouped, book) => {
    if (book.status !== 'gelesen' || !book.completed_year) return grouped
    const year = book.completed_year
    const month = book.completed_month
    if (!grouped[year]) grouped[year] = {}
    if (!grouped[year][month]) grouped[year][month] = []
    grouped[year][month].push(book)
    return grouped
  }, {})
}

export function getMonthName(monthNum) {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ]
  return months[monthNum - 1] || ''
}