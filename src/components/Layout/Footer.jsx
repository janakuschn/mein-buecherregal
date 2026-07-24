// ZIEL-PFAD: src/components/Layout/Footer.jsx (NEUE Datei)
//
// Der Abmelden-Button ist aus dem Header hierher umgezogen, damit er nicht
// mehr mit dem Stern-Symbol überlappt. Er erscheint jetzt am Ende der Seite.
import React from 'react'
import { signOut } from '../../services/authService'

export default function Footer() {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <footer className="app-footer">
      <button className="btn-logout" onClick={handleLogout}>
        Abmelden
      </button>
    </footer>
  )
}
