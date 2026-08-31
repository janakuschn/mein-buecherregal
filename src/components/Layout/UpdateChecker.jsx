// ZIEL-PFAD: src/components/Layout/UpdateChecker.jsx  (NEUE Datei)
//
// Zeigt einen Button an, sobald eine neuere Version der App live ist als
// die gerade geladene. Besonders wichtig für die als Homescreen-Icon
// installierte PWA auf dem iPhone: die merkt selbst nicht automatisch,
// wenn es ein Update gibt, und zeigt sonst einfach den alten Stand.
//
// Funktionsweise: version.json (wird bei jedem Build von vite.config.js
// neu geschrieben, siehe writeVersionFile()) wird regelmäßig mit
// "cache: no-store" abgefragt - das erzwingt eine echte Netzwerk-Anfrage
// statt einer zwischengespeicherten Antwort. Weicht die Version darin von
// der gerade laufenden (__APP_VERSION__) ab, wird der Button angezeigt.
// Klick darauf lädt die Seite mit einem Cache-Buster neu.
import React, { useEffect, useState, useCallback } from 'react'

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // alle 5 Minuten

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.version && data.version !== __APP_VERSION__) {
        setUpdateAvailable(true)
      }
    } catch {
      // Kein Netzwerk verfügbar o.ä. - einfach beim nächsten Versuch erneut prüfen
    }
  }, [])

  useEffect(() => {
    checkForUpdate()
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS)

    // Zusätzlich prüfen, sobald die App wieder in den Vordergrund kommt
    // (z.B. beim Öffnen des Homescreen-Icons nach längerer Pause) - das ist
    // der Moment, in dem ein Update am wahrscheinlichsten verpasst wurde.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [checkForUpdate])

  const handleReload = () => {
    // Cache-Buster in der URL erzwingt, dass auch index.html frisch vom
    // Server geholt wird statt aus einem eventuellen Zwischenspeicher.
    window.location.href = `${window.location.pathname}?_=${Date.now()}`
  }

  if (!updateAvailable) return null

  return (
    <button className="update-banner" onClick={handleReload}>
      🔄 Neue Version verfügbar – Jetzt aktualisieren
    </button>
  )
}
