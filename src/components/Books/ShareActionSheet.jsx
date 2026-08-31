// ZIEL-PFAD: src/components/Books/ShareActionSheet.jsx  (NEUE Datei)
//
// Eigenes Auswahlmenü (im Stil eines iOS-Action-Sheets), das beim
// Gedrückthalten eines Buchcovers erscheint. Grund: das native
// Long-Press-Menü von Links (mit "Teilen"-Option) funktioniert NICHT
// zuverlässig, wenn die App über "Zum Home-Bildschirm" installiert wurde
// (Standalone-Modus) - das ist eine bekannte Einschränkung von iOS Safari,
// unabhängig vom Code hier. Die Web-Share-API (navigator.share) hingegen
// funktioniert auch im Standalone-Modus zuverlässig, deshalb läuft "Teilen"
// darüber.
import React from 'react'

export default function ShareActionSheet({ title, onShare, onOpenThalia, onCancel }) {
  return (
    <div className="share-sheet-overlay" onClick={onCancel}>
      <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="share-sheet-title">{title}</p>
        <button className="share-sheet-btn" onClick={onShare}>
          Teilen
        </button>
        <button className="share-sheet-btn" onClick={onOpenThalia}>
          Bei Thalia öffnen
        </button>
        <button className="share-sheet-btn share-sheet-cancel" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
