import React from 'react'

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav">
      <button onClick={() => onTabChange('aktuell')} className={activeTab === 'aktuell' ? 'active' : ''}>Aktuell</button>
      <button onClick={() => onTabChange('gelesen')} className={activeTab === 'gelesen' ? 'active' : ''}>Gelesen</button>
      <button onClick={() => onTabChange('ungelesen')} className={activeTab === 'ungelesen' ? 'active' : ''}>Ungelesen</button>
    </nav>
  )
}
