// ZIEL-PFAD: src/components/Auth/LoginPage.jsx
import React, { useState } from 'react'
import { signIn } from '../../services/authService'
import { RATING_IMAGES } from '../Books/StarRating'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="auth-header-inner">
          <h1 className="app-title">Mein Bücherregal</h1>
          <div className="auth-header-icons">
            {RATING_IMAGES.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
        </div>
      </header>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Anmelden</h2>
        {error && <p className="auth-error">{error}</p>}
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Lädt...' : 'Anmelden'}
        </button>
      </form>
    </>
  )
}
