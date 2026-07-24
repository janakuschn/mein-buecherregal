// ZIEL-PFAD: src/components/Auth/RegisterPage.jsx
import React, { useState } from 'react'
import { signUp } from '../../services/authService'
import { RATING_IMAGES } from '../Books/StarRating'

function AuthHeader() {
  return (
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
  )
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <AuthHeader />
        <div className="auth-form">
          <p>Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AuthHeader />
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Registrieren</h2>
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
          placeholder="Passwort (mind. 6 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Lädt...' : 'Registrieren'}
        </button>
      </form>
    </>
  )
}
