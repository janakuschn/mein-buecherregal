// ZIEL-PFAD: src/services/openlibrary.js  (ERSETZT den kompletten Inhalt erneut!)
//
// Die App ruft jetzt AUSSCHLIESSLICH die eigene Supabase Edge Function auf.
// Titel/Autor kommen von der DNB, das Cover-Bild wird serverseitig ermittelt,
// heruntergeladen und im eigenen Supabase Storage gespeichert (siehe
// 39_hyperprocessor_FULL_CODE.ts). Der Browser des Nutzers hat zu keinem
// Zeitpunkt direkten Kontakt zu einem Drittanbieter.

import { supabase } from './supabase'

function cleanISBN(isbn) {
  return isbn.replace(/[^0-9Xx]/g, '')
}

export async function lookupByISBN(rawIsbn) {
  const isbn = cleanISBN(rawIsbn)
  if (!isbn) throw new Error('Bitte eine gültige ISBN eingeben.')

  const { data, error } = await supabase.functions.invoke('hyper-processor', {
    body: { isbn },
  })

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
    isbn: data.isbn,
    title: data.title,
    author: data.author,
    cover_url: data.cover_url,
  }
}