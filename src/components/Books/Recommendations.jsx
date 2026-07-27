// ZIEL-PFAD: src/components/Books/Recommendations.jsx (NEUE Datei)
import React, { useState } from 'react'
import { getRecommendations, thaliaSearchUrl } from '../../services/recommendations'

export default function Recommendations({ books }) {
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoad = async () => {
    setLoading(true)
    setError('')
    try {
      const recs = await getRecommendations(books)
      setItems(recs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recommendations">
      <h3 className="recommendations-title">Empfehlungen</h3>

      {!items && !loading && (
        <button className="btn-secondary" onClick={handleLoad}>
          Empfehlungen laden
        </button>
      )}
      {loading && <p className="empty-state">Lädt Empfehlungen...</p>}
      {error && <p className="auth-error">{error}</p>}

      {items && items.length === 0 && (
        <p className="empty-state">Noch keine Empfehlungen gefunden.</p>
      )}

      {items && items.length > 0 && (
        <div className="recommendation-list">
          {items.map((item, i) => (
            <div key={i} className="recommendation-card">
              <div className="recommendation-info">
                <p className="recommendation-book-title">{item.title}</p>
                <p className="recommendation-book-author">{item.author}</p>
                {item.reason && <p className="recommendation-reason">{item.reason}</p>}
              </div>
              <a
                href={thaliaSearchUrl(item.title, item.author)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary recommendation-link"
              >
                Auf Thalia suchen
              </a>
            </div>
          ))}
        </div>
      )}

      {items && !loading && (
        <button className="link-button-muted recommendations-refresh" onClick={handleLoad}>
          Neu laden
        </button>
      )}
    </div>
  )
}
