// ZIEL-PFAD: src/components/Scanner/BarcodeScanner.jsx  (ERSETZT den kompletten Inhalt)
//
// Reine Barcode-Erkennung. Die zusätzliche automatische Texterkennung
// (OCR) als Rückfalloption wurde bewusst wieder entfernt: sie nutzte
// dieselbe Google-Books-Suche ohne API-Key, die nur ein sehr kleines
// Freikontingent erlaubt - mehrere automatische Versuche direkt
// hintereinander führten schnell zu "429 Too Many Requests". Titel lassen
// sich stattdessen einfach manuell im Suchfeld eingeben.
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
