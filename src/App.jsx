// ZIEL-PFAD: src/App.jsx  (ERSETZT den kompletten alten Inhalt!)
import React, { useState } from 'react'
import { AuthProvider, useAuth } from './components/Auth/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import TabNavigation from './components/Tabs/TabNavigation'
import TabContent from './components/Tabs/TabContent'
import LoadingSpinner from './components/Common/LoadingSpinner'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('aktuell')
  const [showRegister, setShowRegister] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null) // null | 'new' | book object
  const [showRatings, setShowRatings] = useState(true)

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

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        showRatings={showRatings}
        onToggleRatings={() => setShowRatings((v) => !v)}
      />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContent
        tab={activeTab}
        showRatings={showRatings}
        selectedBook={selectedBook}
        onSelectBook={setSelectedBook}
        onAddRequest={() => setSelectedBook('new')}
        onCloseModal={() => setSelectedBook(null)}
      />
      <Footer />
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
