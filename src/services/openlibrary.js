// ZIEL-PFAD: src/services/openlibrary.js  (ERSETZT den kompletten Inhalt erneut!)
//
// NEU: Die Suche läuft jetzt direkt aus dem Browser gegen die öffentliche
// Google Books API (kostenlos, kein API-Key nötig, für genau diesen
// Anwendungsfall gedacht - keine eigene Server-Komponente mehr nötig, die
// separat deployed werden müsste). Das ersetzt die frühere Supabase Edge
// Function ("hyper-processor"), die wiederholt Deployment-Probleme
// gemacht hat.
//
// Bei ISBN-Suche (Barcode-Scan) ist das Ergebnis sprachunabhängig - man
// bekommt exakt die Metadaten der gescannten Ausgabe zurück, egal ob
// deutsch oder englisch. Bei der Text-Suche (Cover-Texterkennung als
// Rückfalloption) durchsucht Google Books ebenfalls beide Sprachen.
//
// Cover-Bilder kommen direkt von Google und werden nicht mehr zusätzlich
// in einem eigenen Storage zwischengespeichert - das Bild wird einfach per
// <img src="..."> geladen, ganz normal wie jedes Bild im Web. Gibt es kein
// Bild, bleibt cover_url leer und die App zeigt den Herz-Platzhalter mit
// Buchtitel (bereits vorhanden).
//
// Datenschutz-Hinweis: Die Such-Anfrage (Titel/ISBN) geht jetzt direkt vom
// Browser der Nutzerin an Google, nicht mehr über den eigenen Server. Es
// werden dabei keine personenbezogenen Daten außer der IP-Adresse (durch
// die Anfrage selbst, wie bei jedem Webaufruf) übertragen.

function cleanISBN(isbn) {
  return isbn.replace(/[^0-9Xx]/g, '')
}

function extractFromGoogleItem(item) {
  const info = item?.volumeInfo
  if (!info || !info.title) return null

  const identifiers = info.industryIdentifiers || []
  const isbnEntry =
    identifiers.find((i) => i.type === 'ISBN_13') || identifiers.find((i) => i.type === 'ISBN_10')

  const img = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail

  return {
    isbn: isbnEntry ? isbnEntry.identifier.replace(/[^0-9Xx]/g, '') : '',
    title: info.title,
    author: (info.authors || []).join(', '),
    cover_url: img ? img.replace('http://', 'https://').replace('&edge=curl', '') : null,
  }
}

export async function lookupByISBN(rawIsbn) {
  const isbn = cleanISBN(rawIsbn)
  if (!isbn) throw new Error('Bitte eine gültige ISBN eingeben.')

  let data
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data = await res.json()
  } catch (err) {
    console.error('[Buch-Lookup] Technischer Fehler:', err)
    throw new Error(
      'Technischer Fehler bei der Suche. Öffne die Browser-Konsole (F12) für Details.'
    )
  }

  const result = extractFromGoogleItem(data.items?.[0])
  if (!result) {
    throw new Error('Buch nicht gefunden. Bitte Titel/Autor manuell eingeben.')
  }

  // Die eingegebene/gescannte ISBN behalten, falls Google keine eigene
  // zurückgibt (z.B. bei manchen älteren Ausgaben).
  return { ...result, isbn: result.isbn || isbn }
}

// Suche per erkanntem Cover-Text (z.B. aus der Texterkennung beim Scannen,
// wenn kein Barcode gefunden wurde).
export async function lookupByText(rawQuery) {
  const query = (rawQuery || '').trim()
  if (!query) throw new Error('Kein Text erkannt.')

  let data
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data = await res.json()
  } catch (err) {
    console.error('[Buch-Lookup] Technischer Fehler:', err)
    throw new Error(
      'Technischer Fehler bei der Suche. Öffne die Browser-Konsole (F12) für Details.'
    )
  }

  const items = data.items || []
  let result = null
  for (const item of items) {
    result = extractFromGoogleItem(item)
    if (result) break
  }

  if (!result) {
    throw new Error('Buch nicht gefunden. Bitte Titel/Autor manuell eingeben.')
  }

  return result
}
