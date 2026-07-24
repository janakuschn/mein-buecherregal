// ZIEL-PFAD: src/components/Layout/Header.jsx
import React from 'react'
import { signOut } from '../../services/authService'

export default function Header({ onWishlistClick }) {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="app-header">
      <button className="icon-button wishlist-star" onClick={onWishlistClick} title="Wunschliste">
        ★
      </button>
      <h1 className="app-title">Mein Bücherregal</h1>
      <button className="btn-logout" onClick={handleLogout}>
        Abmelden
      </button>
    </header>
  )
}
