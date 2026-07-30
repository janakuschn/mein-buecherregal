// ZIEL-PFAD: src/components/Auth/ChangePasswordModal.jsx  (NEUE Datei)
//
// Erlaubt es einem bereits eingeloggten Nutzer (egal ob per Passwort oder
// per Einladungslink angemeldet), ein Passwort zu setzen/ändern. Das ist
// KEIN Registrierungsweg: die Funktion ist nur innerhalb der App sichtbar,
// also nur für jemanden erreichbar, der bereits eine gültige Sitzung hat
// (z.B. durch einen echten Einladungslink von Jana). Es können dadurch
// keine neuen Konten angelegt werden.
import React, { useState } from 'react'
import { updatePassword } from '../../services/authService'

export default function ChangePasswordModal({ onClose }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen haben.')
      return
    }
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Passwort konnte nicht geändert werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <h2>Passwort ändern</h2>

        {success ? (
          <p>Dein Passwort wurde erfolgreich geändert.</p>
        ) : (
          <form className="lend-form" onSubmit={handleSubmit}>
            {error && <p className="auth-error">{error}</p>}
            <input
              type="password"
              placeholder="Neues Passwort (mind. 8 Zeichen)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Passwort wiederholen"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Speichert...' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
