// ZIEL-PFAD: src/utils/thalia.js  (NEUE Datei)
//
// Baut einen Link zur Thalia-Suche für eine ISBN. Wird als echtes <a href>
// auf dem Buchcover platziert (siehe BookCard.jsx) - dadurch zeigt iOS
// Safari beim Gedrückthalten automatisch das native "Teilen"-Menü mit
// diesem Link an, ganz ohne eigene Long-Press-Logik.

// Manuell angelegte Bücher ohne gefundene ISBN bekommen einen Platzhalter
// wie "manual-1234567890" (siehe BookModal.jsx handleSave). Das ist keine
// echte ISBN und darf nicht verlinkt werden.
export function isRealIsbn(isbn) {
  if (!isbn) return false
  const cleaned = String(isbn).replace(/[^0-9Xx]/g, '')
  return cleaned.length === 10 || cleaned.length === 13
}

export function thaliaUrlForIsbn(isbn) {
  const cleaned = String(isbn).replace(/[^0-9Xx]/g, '')
  return `https://www.thalia.de/shop/home/suchartikel/?sq=${encodeURIComponent(cleaned)}`
}
