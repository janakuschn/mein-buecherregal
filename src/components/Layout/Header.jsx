// ZIEL-PFAD: src/components/Layout/Header.jsx
//
// Das Herz öffnet auf jedem Tab das Lese-Dashboard (Statistiken). Der
// frühere Bewertungs-Ein/Ausblenden-Toggle im Tab "Gelesen" ist entfallen -
// die Bewertungen werden dort jetzt immer angezeigt. Zusätzlich über
// "Statistiken" im Footer erreichbar (siehe Footer.jsx).
// Der Abmelden-Button lebt in Footer.jsx.
import React, { useState } from 'react'
import { RATING_IMAGES } from '../Books/StarRating'
import DashboardModal from './DashboardModal'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function Header() {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <header className="app-header">
      <button
        className="icon-button rating-toggle rating-toggle-active"
        onClick={() => setShowDashboard(true)}
        title="Statistiken anzeigen"
        aria-label="Statistiken anzeigen"
      >
        {/* alt="" da das Bild rein dekorativ ist - der Name kommt vom
            aria-label oben. */}
        <img src={heartIcon} alt="" className="rating-toggle-icon" />
      </button>
      <h1 className="app-title">Mein Bücherregal</h1>

      {showDashboard && <DashboardModal onClose={() => setShowDashboard(false)} />}
    </header>
  )
}
