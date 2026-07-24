// ZIEL-PFAD: src/App.jsx  (ERSETZT den kompletten alten Inhalt!)
import React, { useState } from 'react'
import { AuthProvider, useAuth } from './components/Auth/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import Header from './components/Layout/Header'
import TabNavigation from './components/Tabs/TabNavigation'
import TabContent from './components/Tabs/TabContent'
import LoadingSpinner from './components/Common/LoadingSpinner'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('aktuell')
  const [showRegister, setShowRegister] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null) // null | 'new' | book object
  const [wishlistOnly, setWishlistOnly] = useState(false)

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <>
            <RegisterPage />
            <p className="auth-switch">
              Bereits registriert?{' '}
              <button className="link-button" onClick={() => setShowRegister(false)}>
                Hier anmelden
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginPage />
            <p className="auth-switch">
              Kein Konto?{' '}
              <button className="link-button" onClick={() => setShowRegister(true)}>
                Hier registrieren
              </button>
            </p>
          </>
        )}
      </div>
    )
  }

  const handleWishlistClick = () => {
    setActiveTab('ungelesen')
    setWishlistOnly(true)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setWishlistOnly(false)
  }

  return (
    <div className="app-layout">
      <Header onWishlistClick={handleWishlistClick} />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <TabContent
        tab={activeTab}
        wishlistOnly={wishlistOnly}
        selectedBook={selectedBook}
        onSelectBook={setSelectedBook}
        onAddRequest={() => setSelectedBook('new')}
        onCloseModal={() => setSelectedBook(null)}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
