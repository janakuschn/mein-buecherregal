// src/App.jsx
// Main App Component mit Auth-Context + Tab-Navigation

import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './components/Auth/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import Layout from './components/Layout/Layout'
import TabNavigation from './components/Tabs/TabNavigation'
import TabContent from './components/Tabs/TabContent'
import LoadingSpinner from './components/Common/LoadingSpinner'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('aktuell') // 'aktuell' | 'gelesen' | 'ungelesen'
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return <LoadingSpinner />
  }

  // Nutzer nicht angemeldet → Login/Register
  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <>
            <RegisterPage />
            <p>
              Bereits registriert?{' '}
              <button
                className="link-button"
                onClick={() => setShowRegister(false)}
              >
                Hier anmelden
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginPage />
            <p>
              Kein Konto?{' '}
              <button
                className="link-button"
                onClick={() => setShowRegister(true)}
              >
                Hier registrieren
              </button>
            </p>
          </>
        )}
      </div>
    )
  }

  // Nutzer angemeldet → App
  return (
    <Layout>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContent tab={activeTab} />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
