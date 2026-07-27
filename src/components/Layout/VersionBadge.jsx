// ZIEL-PFAD: src/components/Layout/VersionBadge.jsx  (NEUE Datei)
//
// Kleine, immer sichtbare Anzeige unten links, welcher Stand (Commit-Hash +
// Build-Zeitpunkt) gerade tatsächlich live ist. __APP_VERSION__ und
// __BUILD_TIME__ werden beim Build von vite.config.js automatisch gesetzt -
// kein manuelles Pflegen nötig.
import React from 'react'

export default function VersionBadge() {
  let buildDate = ''
  try {
    buildDate = new Date(__BUILD_TIME__).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    buildDate = ''
  }

  return (
    <div className="version-badge">
      v{__APP_VERSION__}
      {buildDate ? ` · ${buildDate}` : ''}
    </div>
  )
}
