# Mein Bücherregal - GitHub Pages Anleitung

## 🚀 Die PWA ist fertig!

Diese Progressive Web App (PWA) ist eine vollständig private Buchverwaltungs-App, die:
- ✅ Kein Passwort-Update braucht (läuft dauerhaft)
- ✅ Komplett datenschutzkonform ist (alle Daten lokal)
- ✅ Offline funktioniert
- ✅ Wie eine native App auf dem iPhone funktioniert

---

## 📋 Dateien, die du brauchst

```
MeinBücherregal_PWA/
  ├── index.html        (Hauptdatei - die ganze App)
  ├── manifest.json     (PWA-Metadaten)
  ├── sw.js            (Service Worker - Offline-Support)
  ├── DATENSCHUTZ.md   (Deutsche Datenschutzerklärung)
  └── README.md        (Diese Datei)
```

---

## 🔧 Installation auf GitHub Pages (5 Minuten)

### Schritt 1: GitHub Repository erstellen
1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke auf **„+"** → **„New repository"**
3. Repository-Name: `mein-buecherregal` (oder wie du möchtest)
4. **Public** (wichtig für GitHub Pages)
5. **Add a README file** aktivieren
6. Klicke **„Create repository"**

### Schritt 2: Dateien hochladen
1. Im Repository klicke auf **„Add file"** → **„Upload files"**
2. Lade diese 4 Dateien hoch:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `DATENSCHUTZ.md`
3. Unten: Schreibe **„Add PWA files"** als Commit-Message
4. Klicke **„Commit changes"**

### Schritt 3: GitHub Pages aktivieren
1. Gehe in deinem Repository zu **Settings**
2. Scroll down zu **„Pages"** (links im Menü)
3. **Source:** Stelle sicher, dass **„Deploy from a branch"** ausgewählt ist
4. **Branch:** `main` / `/ (root)`
5. Klicke **„Save"**

GitHub wird jetzt automatisch die App deployen. Nach ~1-2 Minuten ist sie live!

---

## 📱 App auf dem iPhone installieren

### So funktioniert's:
1. Öffne **Safari** auf deinem iPhone
2. Gehe zu: `https://[dein-github-username].github.io/mein-buecherregal`
3. Tippe auf **„Teilen"** (Pfeil-Symbol unten)
4. Scroll down und wähle **„Zum Home-Bildschirm"**
5. Tippe **„Hinzufügen"**

Die App wird jetzt auf deinem Home Screen wie eine echte App angezeigt. Sie funktioniert auch offline!

---

## 🔐 Erste Nutzung

1. **Passwort erstellen:** Beim ersten Start legst du ein Passwort fest
2. **Bücher hinzufügen:**
   - Foto aufnehmen
   - Aus Galerie wählen
   - Titel & Autor eingeben
3. **Bücher verwalten:** In den 3 Tabs (Aktuell, Gelesen, Ungelesen)
4. **Bewertungen:** Stern-Icon oben rechts zum Ein-/Ausblenden

---

## 🔑 Passwort vergessen?

**Achtung:** Das Passwort kann NICHT wiederhergestellt werden, da es lokal verschlüsselt ist.

**So setzt du es zurück:**
1. Gehe zu **Passwort vergessen?** auf dem Login-Screen
2. Klicke **„Alles löschen & neu starten"**
3. Alle Daten werden gelöscht
4. Erstelle ein neues Passwort
5. Starte neu

---

## 🔒 Datenschutz & Sicherheit

- ✅ **100% lokal:** Alle Daten bleiben auf deinem iPhone
- ✅ **Keine Cloud:** Nichts wird hochgeladen
- ✅ **Verschlüsselt:** Passwort ist lokal verschlüsselt
- ✅ **DSGVO-konform:** Keine Datenübertragung
- ✅ **Kein Tracking:** Keine Analytics, kein Monitoring
- ✅ **Offline:** Die App funktioniert auch ohne Internetverbindung

Vollständige Datenschutzerklärung: `DATENSCHUTZ.md`

---

## 🔄 Updates durchführen

Falls du die App später aktualisieren möchtest:

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf die Datei (z.B. `index.html`)
3. Klicke auf das **Stift-Icon** (Edit)
4. Mache deine Änderungen
5. Klicke **„Commit changes"**

Die Änderungen sind dann sofort live. Um die neue Version auf deinem iPhone zu nutzen, aktualisiere die App: Home Screen → gedrückt halten auf die App → „App-Einstellungen" → ggf. neu laden.

---

## ⚠️ Wichtige Hinweise

1. **GitHub Pages ist kostenlos** – für immer
2. **Die App läuft auf deinem iPhone** – kein Xcode, kein Apple Developer Account nötig
3. **Daten verlassen dein iPhone nie** – 100% privat
4. **Die App funktioniert offline** – auch ohne WLAN/Mobile
5. **Keine Erneuerung nötig** – kein 7-Tage-Problem wie bei Xcode

---

## 🆘 Troubleshooting

### App wird nicht auf GitHub Pages angezeigt?
- Warte 2-3 Minuten nach dem Upload
- Gehe zu Repository → Settings → Pages und überprüfe den Status
- Leere den Browser-Cache (Strg+Shift+Delete / Cmd+Shift+Delete)

### PWA wird nicht installiert?
- Nutze Safari (nicht Chrome)
- Gehe sicher, dass du HTTPS verwendest (`https://` nicht `http://`)
- Die App muss einmal vollständig geladen sein

### Passwort vergessen?
- Es kann nicht wiederhergestellt werden
- Nutze die „Alles löschen" Option und starte neu

### Daten werden nicht gespeichert?
- Überprüfe, ob der Browser-Storage aktiviert ist
- Versuche, die App neu zu laden
- Einige Browser haben Datenschutz-Einstellungen, die den Storage begrenzen

---

## 📞 Support

Diese App hat keinen zentralen Support, da sie vollständig privat läuft. Bei Bugs kannst du:
- Die Browser-Konsole überprüfen (Safari: Einstellungen → Erweitert → Web Inspector)
- Den Code auf GitHub überprüfen und ggf. anpassen
- Ein Issue im GitHub Repository erstellen

---

**Genießen dein privates Bücherregal!** 📚✨
