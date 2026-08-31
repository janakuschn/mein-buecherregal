// ZIEL-PFAD: src/services/openlibrary.js  (ERSETZT den kompletten Inhalt erneut!)
//
// ZURÜCK auf die Supabase Edge Function ("hyper-processor"): der direkte
// Aufruf der Google Books API aus dem Browser (ohne API-Key) ist zu streng
// limitiert und lieferte selbst bei einzelnen Anfragen "429 Too Many
// Requests". Die Anfrage läuft jetzt wieder über den eigenen Server -
// andere IP-Adresse als der Browser der Nutzerin, dadurch nicht vom
// gleichen Limit betroffen.
//
// WICHTIG für die Supabase-Konfiguration: bei der Funktion "hyper-processor"
// unter Settings sollte "Verify JWT with legacy secret" AUS sein (Supabase
// empfiehlt das selbst so, wenn die Funktion keine eigene Auth-Logik hat -
// das war vermutlich die Ursache für die bisherigen 404-Fehler beim
// Aufruf über die echte App, obwohl der Dashboard-eigene "Test"-Button
// erfolgreich war).

import { supabase } from './supabase'

function cleanISBN(isbn) {
  return isbn.replace(/[^0-9Xx]/g, '')
}

async function callHyperProcessor(body) {
  const { data, error } = await supabase.functions.invoke('hyper-processor', { body })

  if (error) {
    console.error('[Buch-Lookup] Technischer Fehler:', error)
    throw new Error(
      'Technischer Fehler bei der Suche. Öffne die Browser-Konsole (F12) für Details.'
    )
  }

  if (!data || data.error) {
    console.warn('[Buch-Lookup] Antwort:', data)
    throw new Error(data?.error || 'Buch nicht gefunden. Bitte Titel/Autor manuell eingeben.')
  }

  return {
    isbn: data.isbn || '',
    title: data.title,
    author: data.author,
    cover_url: data.cover_url,
    pageCount: data.pageCount || null,
    description: data.description || '',
  }
}

export async function lookupByISBN(rawIsbn) {
  const isbn = cleanISBN(rawIsbn)
  if (!isbn) throw new Error('Bitte eine gültige ISBN eingeben.')
  return callHyperProcessor({ isbn })
}

// Suche per Titel (z.B. wenn kein Barcode gefunden wurde oder direkt im
// Suchfeld ein Titel statt einer ISBN eingegeben wird).
export async function lookupByText(rawQuery) {
  const query = (rawQuery || '').trim()
  if (!query) throw new Error('Kein Text erkannt.')
  return callHyperProcessor({ query })
}
