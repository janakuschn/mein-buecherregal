// ZIEL-PFAD: src/components/Tabs/TabNavigation.jsx
import React from 'react'

const TABS = [
  { id: 'aktuell', label: 'Aktuell' },
  { id: 'gelesen', label: 'Gelesen' },
  { id: 'ungelesen', label: 'Ungelesen' },
]

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className="tab-navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-pill ${activeTab === tab.id ? 'tab-pill-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
