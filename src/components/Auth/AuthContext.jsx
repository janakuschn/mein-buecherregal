// src/components/Auth/AuthContext.jsx
// Auth-Context für globale Auth-State Management

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kontrolliere ob nutzer bereits angemeldet ist
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Auth check failed:', error.message)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe zu Auth-Changes (wenn nutzer sich in einem anderen Tab anmeldet)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
