// ZIEL-PFAD: src/services/bookService.js
import { supabase } from './supabase'

export async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function reorderBooks(updates) {
  // updates: [{ id, sort_order }, ...]
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from('books').update({ sort_order }).eq('id', id)
    )
  )
}

export async function addBook(book) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { data, error } = await supabase
    .from('books')
    .insert([{ ...book, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBook(id, updates) {
  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBook(id) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
  if (error) throw error
}