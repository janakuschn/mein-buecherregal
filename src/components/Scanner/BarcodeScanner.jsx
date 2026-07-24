// ZIEL-PFAD: src/components/Scanner/BarcodeScanner.jsx
import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let active = true

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!active || !result) return
        active = false
        onDetected(result.getText())
      })
      .catch(() => {
        setError('Kamera konnte nicht gestartet werden. Bitte Berechtigung erlauben.')
      })

    return () => {
      active = false
      try {
        reader.reset()
      } catch (e) {
        // ignore
      }
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
