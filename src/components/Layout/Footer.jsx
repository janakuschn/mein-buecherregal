// ZIEL-PFAD: src/components/Layout/Footer.jsx
//
// Der Abmelden-Button ist aus dem Header hierher umgezogen, damit er nicht
// mehr mit dem Stern-Symbol überlappt. Er erscheint jetzt am Ende der Seite.
// Darunter zusätzlich Links zu Kontakt/Datenschutz (öffnen ein Overlay im
// gleichen Stil wie die Buch-Detailansicht).
import React, { useState } from 'react'
import { signOut } from '../../services/authService'
import LegalModal from './LegalModal'

export default function Footer() {
  const [legalPage, setLegalPage] = useState(null) // null | 'kontakt' | 'datenschutz'

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <button className="btn-logout" onClick={handleLogout}>
          Abmelden
        </button>
        <div className="app-footer-legal">
          <button className="link-button-muted" onClick={() => setLegalPage('kontakt')}>
            Kontakt
          </button>
          <span aria-hidden="true"> · </span>
          <button className="link-button-muted" onClick={() => setLegalPage('datenschutz')}>
            Datenschutz
          </button>
        </div>
      </div>

      {legalPage && <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />}
    </footer>
  )
}
