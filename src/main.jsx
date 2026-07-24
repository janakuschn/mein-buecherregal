import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// index.css (altes Vite-Template-Stylesheet) wird nicht mehr geladen. Die
// darin enthaltenen, tatsächlich sichtbaren Effekte (Basis-Schriftgröße für
// rem-Einheiten, zentrierte Textausrichtung, h2-Stil, Absatz-Abstand) wurden
// 1:1 nach App.css übernommen, damit sich am aktuellen Erscheinungsbild
// nichts ändert. Entfallen sind nur die inaktiven Teile: der Dark-Mode-
// Farbwechsel (der nur bei dunklem Systemmodus gegriffen hätte und dort zu
// Farbkonflikten mit dem eigenen Design geführt hätte) und ungenutzte Reste
// (Counter/Code/Social-Icon-Stile aus dem Vite-Beispielprojekt).

// StrictMode wurde entfernt: Es lässt React in der Entwicklungsumgebung jede
// Komponente zweimal in schneller Folge starten, um Effekt-Fehler zu finden.
// Beim Kamera-Scanner kollidieren dadurch zwei parallele Kamera-Starts
// (sichtbar als "AbortError: play() request was interrupted"). Ohne
// StrictMode läuft der Scanner zuverlässig - alle anderen Funktionen bleiben
// unverändert.
createRoot(document.getElementById('root')).render(<App />)
