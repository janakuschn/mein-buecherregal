// ZIEL-PFAD: src/components/Layout/Header.jsx
//
// Das Herz ist auf allen Tabs sichtbar und dort (Aktuell/Ungelesen) immer
// vollfarbig eingeblendet. Nur auf dem Tab "Gelesen" hat es eine Funktion:
// dort schaltet es die Bewertungen unter den Covern ein/aus und ist
// dementsprechend ausgegraut, solange die Bewertungen ausgeblendet sind.
// Der Abmelden-Button lebt in Footer.jsx.
import React from 'react'
import { RATING_IMAGES } from '../Books/StarRating'

const heartIcon = RATING_IMAGES[4] // ehemals "Bild 5"

export default function Header({ activeTab, showRatings, onToggleRatings }) {
  const isGelesen = activeTab === 'gelesen'
  const isActive = !isGelesen || showRatings

  return (
    <header className="app-header">
      <button
        className={`icon-button rating-toggle ${isActive ? 'rating-toggle-active' : ''} ${
          !isGelesen ? 'rating-toggle-disabled' : ''
        }`}
        onClick={isGelesen ? onToggleRatings : undefined}
        disabled={!isGelesen}
        title={isGelesen ? (showRatings ? 'Bewertungen ausblenden' : 'Bewertungen anzeigen') : undefined}
      >
        <img src={heartIcon} alt="Bewertungen" className="rating-toggle-icon" />
      </button>
      <h1 className="app-title">Mein Bücherregal</h1>
    </header>
  )
}
