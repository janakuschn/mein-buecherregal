// ZIEL-PFAD: src/components/Scanner/BarcodeScanner.jsx  (ERSETZT den kompletten Inhalt)
//
// EIN Button zum Scannen, zwei Erkennungswege dahinter:
// 1) Barcode-Erkennung läuft sofort und durchgehend (wie bisher).
// 2) Wird nach ein paar Sekunden kein Barcode gefunden (z.B. weil das Buch
//    keinen sichtbaren Barcode zeigt), wird automatisch ein Kamerabild
//    aufgenommen und per Texterkennung (OCR, läuft komplett im Browser,
//    kein Bild-Upload an Dritte) der Titel/Text auf dem Cover erkannt.
//    Dieser Text wird dann zur Suche verwendet.
// Ein manueller Button erlaubt es, die Texterkennung auch sofort
// auszulösen, statt die paar Sekunden zu warten.
import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import Tesseract from 'tesseract.js'

const OCR_FALLBACK_DELAY_MS = 4000

// Wartet, bis das <video>-Element tatsächlich ein Bild mit Maßen liefert
// (video.videoWidth/videoHeight). Direkt nach dem Start der Kamera oder
// kurz nach dem Öffnen des Scanners kann das noch 0 sein, auch wenn keine
// Fehlermeldung kam - das führte zuvor zum Abbruch "Kamerabild noch nicht
// bereit." Statt sofort aufzugeben, wird jetzt bis zu 3 Sekunden gewartet.
function waitForVideoReady(video, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    if (video.videoWidth && video.videoHeight) {
      resolve()
      return
    }
    const start = Date.now()
    const check = () => {
      if (video.videoWidth && video.videoHeight) {
        resolve()
      } else if (Date.now() - start > timeoutMs) {
        reject(new Error('Kamerabild konnte nicht geladen werden.'))
      } else {
        setTimeout(check, 150)
      }
    }
    check()
  })
}

export default function BarcodeScanner({ onDetected, onTextDetected, onClose }) {
  const videoRef = useRef(null)
  const runOcrRef = useRef(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Suche Barcode...')
  const [ocrRunning, setOcrRunning] = useState(false)
  const [barcodeActive, setBarcodeActive] = useState(true)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls = null
    let isMounted = true
    let finished = false
    let fallbackTimer = null

    const stopAll = () => {
      finished = true
      if (fallbackTimer) clearTimeout(fallbackTimer)
      controls?.stop()
    }

    const runOcr = async () => {
      if (finished || !videoRef.current) return
      finished = true
      if (fallbackTimer) clearTimeout(fallbackTimer)
      controls?.stop()
      setBarcodeActive(false)
      setOcrRunning(true)
      setStatus('Erkenne Text auf dem Cover...')
      try {
        const video = videoRef.current
        await waitForVideoReady(video)
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Als Data-URL (statt des Canvas-Elements selbst) an Tesseract
        // übergeben - canvas.toBlob() liefert auf manchen Geräten/Browsern
        // (v.a. iOS Safari als installierte PWA) null zurück, was dort zu
        // "readAsArrayBuffer: parameter 1 is not of type Blob" führte.
        // toDataURL() ist deutlich zuverlässiger unterstützt.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

        const { data } = await Tesseract.recognize(dataUrl, 'deu+eng')
        const lines = data.text
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').length >= 3)

        if (!isMounted) return

        if (lines.length === 0) {
          setError('Kein lesbarer Text auf dem Cover gefunden. Bitte Titel manuell eingeben.')
          setOcrRunning(false)
          return
        }

        // Heuristik: die längste erkannte Textzeile ist auf Buchcovern meist
        // der Titel (größte Schrift = meist am meisten Zeichen erfasst).
        const sorted = [...lines].sort((a, b) => b.length - a.length)
        const query = sorted.slice(0, 2).join(' ')
        onTextDetected(query)
      } catch (e) {
        // Detaillierten Fehler in der Konsole ausgeben (F12 -> Console),
        // damit sich ein Fehlschlag konkret nachvollziehen lässt, statt nur
        // die allgemeine Meldung im UI zu sehen.
        console.error('[Texterkennung] Fehler:', e)
        if (isMounted) {
          setError(
            `Texterkennung fehlgeschlagen: ${e?.message || 'Unbekannter Fehler'}. Bitte Titel manuell eingeben.`
          )
          setOcrRunning(false)
        }
      }
    }

    runOcrRef.current = runOcr

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, ctrls) => {
        if (!controls && ctrls) controls = ctrls
        if (!isMounted || finished || !result) return
        finished = true
        if (fallbackTimer) clearTimeout(fallbackTimer)
        controls?.stop()
        onDetected(result.getText())
      })
      .then((ctrls) => {
        controls = ctrls
        if (!isMounted) {
          controls.stop()
          return
        }
        fallbackTimer = setTimeout(runOcr, OCR_FALLBACK_DELAY_MS)
      })
      .catch(() => {
        if (isMounted) {
          setError('Kamera konnte nicht gestartet werden. Bitte Berechtigung erlauben.')
        }
      })

    return () => {
      isMounted = false
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="scanner-overlay">
      <div className="scanner-box">
        <video ref={videoRef} className="scanner-video" />
        <p className="scanner-status">{ocrRunning ? `${status} 🔄` : status}</p>
        {error && <p className="scanner-error">{error}</p>}
        {barcodeActive && !error && (
          <button className="link-button-muted" onClick={() => runOcrRef.current?.()}>
            Kein Barcode sichtbar? Cover-Text jetzt erkennen
          </button>
        )}
        <button className="btn-secondary" onClick={onClose}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
