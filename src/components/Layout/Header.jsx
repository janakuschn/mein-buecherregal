// ZIEL-PFAD: src/components/Layout/Header.jsx
//
// Das Herz ist auf allen Tabs sichtbar. Auf "Gelesen" schaltet es wie
// bisher die Bewertungen unter den Covern ein/aus. Auf "Aktuell" und
// "Ungelesen" war es bisher rein dekorativ (voll eingefärbt, aber ohne
// Funktion) - das war genau der Button, der in der UX-Review als
// "sieht aktiv aus, tut aber nichts" bemängelt wurde. Jetzt öffnet es dort
// stattdessen das Lese-Dashboard (Statistiken). Zusätzlich über einen
// Link im Footer erreichbar - auch vom Tab Gelesen aus, wo das Herz
// weiterhin die Bewertungen umschaltet.
// Der Abmelden-Button lebt in Footer.jsx.
import React, { useState } from 'react'
import { RATING_IMAGES } from '../Books/StarRating'
import DashboardModal from './DashboardModal'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function Header({ activeTab, showRatings, onToggleRatings }) {
  const isGelesen = activeTab === 'gelesen'
  const isActive = !isGelesen || showRatings
  const [showDashboard, setShowDashboard] = useState(false)

  const handleClick = () => {
    if (isGelesen) {
      onToggleRatings()
    } else {
      setShowDashboard(true)
    }
  }

  return (
    <header className="app-header">
      <button
        className={`icon-button rating-toggle ${isActive ? 'rating-toggle-active' : ''}`}
        onClick={handleClick}
        title={isGelesen ? (showRatings ? 'Bewertungen ausblenden' : 'Bewertungen anzeigen') : 'Statistiken anzeigen'}
        aria-label={
          isGelesen
            ? showRatings
              ? 'Bewertungen ausblenden'
              : 'Bewertungen anzeigen'
            : 'Statistiken anzeigen'
        }
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
