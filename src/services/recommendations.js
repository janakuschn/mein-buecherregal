// ZIEL-PFAD: src/services/recommendations.js (NEUE Datei)
//
// Ruft die Supabase Edge Function "book-recommendations" auf. Es werden
// bewusst nur Titel/Autor/Bewertung der gelesenen Bücher mitgeschickt,
// keine persönlichen Notizen (Datenminimierung).
import { supabase } from './supabase'

export async function getRecommendations(books) {
  const payload = (books || [])
    .filter((b) => b.status === 'gelesen')
    .map((b) => ({ title: b.title, author: b.author, rating: b.rating }))

  const { data, error } = await supabase.functions.invoke('book-recommendations', {
    body: { books: payload },
  })

  if (error) {
    console.error('[Empfehlungen] Technischer Fehler:', error)
    throw new Error('Empfehlungen konnten nicht geladen werden.')
  }
  if (!data || data.error) {
    throw new Error(data?.error || 'Keine Empfehlungen erhalten.')
  }
  return data.recommendations || []
}

export function thaliaSearchUrl(title, author) {
  const q = encodeURIComponent([title, author].filter(Boolean).join(' '))
  return `https://www.thalia.de/shop/home/suchartikel/?sq=${q}`
}
