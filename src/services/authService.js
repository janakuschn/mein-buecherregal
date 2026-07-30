// ZIEL-PFAD: src/services/authService.js
import { supabase } from './supabase'

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/mein-buecherregal/`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Setzt/ändert das Passwort des AKTUELL EINGELOGGTEN Nutzers. Erstellt kein
// neues Konto - erfordert eine bereits bestehende, gültige Sitzung (z.B.
// nach Klick auf einen echten Einladungslink oder normalem Login).
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}