import React from 'react'

export default function TabContent({ tab }) {
  if (tab === 'aktuell') return <div>Aktuelle Bücher</div>
  if (tab === 'gelesen') return <div>Gelesene Bücher</div>
  return <div>Ungelesene Bücher</div>
}
