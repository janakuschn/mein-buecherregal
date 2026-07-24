// ZIEL-PFAD: src/components/Scanner/BarcodeScanner.jsx
//
// FEHLERURSACHE: `reader.reset()` existiert in der installierten
// @zxing/browser-Version gar nicht - der Aufruf ist beim Schließen immer
// fehlgeschlagen und wurde vom leeren catch-Block verschluckt. Die Kamera
// wurde dadurch nie wirklich gestoppt.
//
// FIX: `decodeFromVideoDevice` liefert ein "controls"-Objekt mit einer
// echten `.stop()`-Methode, die den Kamera-Stream tatsächlich beendet.
// Dieses Objekt wird jetzt gespeichert und beim Schließen (Abbrechen-
// Button, Unmount oder erfolgreicher Scan) aufgerufen.
import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls = null
    let isMounted = true
    let detected = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, ctrls) => {
        if (!controls && ctrls) controls = ctrls
        if (!isMounted || detected || !result) return
        detected = true
        controls?.stop()
        onDetected(result.getText())
      })
      .then((ctrls) => {
        controls = ctrls
        // Falls die Komponente schon geschlossen wurde, bevor die Kamera
        // bereit war: sofort wieder stoppen.
        if (!isMounted) controls.stop()
      })
      .catch(() => {
        if (isMounted) {
          setError('Kamera konnte nicht gestartet werden. Bitte Berechtigung erlauben.')
        }
      })

    return () => {
      isMounted = false
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="scanner-overlay">
      <div className="scanner-box">
        <video ref={videoRef} className="scanner-video" />
        {error && <p className="scanner-error">{error}</p>}
        <button className="btn-secondary" onClick={onClose}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
