// ZIEL-PFAD: src/components/Layout/LegalModal.jsx (NEUE Datei)
//
// Einfaches Overlay für "Kontakt" und "Datenschutz", im gleichen Stil wie
// die Buch-Detailansicht (modal-overlay/modal-content), damit es sich
// nahtlos in die App einfügt.
import React from 'react'

const CONTACT_EMAIL = 'janakuschn@gmail.com'

const CONTENT = {
  kontakt: {
    title: 'Kontakt',
    body: (
      <>
        <p>
          Diese App wird privat und nicht-kommerziell von Jana Kuschnerus betrieben.
        </p>
        <p>
          Fragen, Löschwünsche oder Hinweise gerne an: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </>
    ),
  },
  datenschutz: {
    title: 'Datenschutz',
    body: (
      <>
        <p>
          Diese App ist ein privates, nicht-kommerzielles Projekt für einen kleinen,
          geschlossenen Nutzerkreis. Es findet kein Tracking und keine Analyse deines
          Nutzungsverhaltens statt.
        </p>
        <p>
          Beim Anmelden werden deine E-Mail-Adresse und ein verschlüsseltes Passwort über
          den Dienst Supabase (gehostet in der EU, Frankfurt) gespeichert und verwaltet.
          Die von dir angelegten Bucheinträge (Titel, Autor, Bewertung, Notizen, Status)
          werden ebenfalls dort gespeichert und sind ausschließlich für dein eigenes Konto
          sichtbar. Zur Anmeldung wird ein technisch notwendiges Sitzungs-Token lokal in
          deinem Browser gespeichert; das dient ausschließlich dem Login und keiner Analyse.
        </p>
        <p>
          Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen oder deren
          Löschung – wende dich dazu an: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </>
    ),
  },
}

export default function LegalModal({ page, onClose }) {
  const content = CONTENT[page]
  if (!content) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <h2>{content.title}</h2>
        <div className="legal-modal-body">{content.body}</div>
      </div>
    </div>
  )
}
