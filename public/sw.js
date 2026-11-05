// Service Worker nur für Push-Mitteilungen (Rückgabe-Erinnerungen für
// geliehene Bücher). Bewusst KEIN fetch-Handler/Cache: die App lädt weiter
// immer frisch aus dem Netz, das Update-Banner bleibt unverändert.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  const scope = self.registration.scope
  event.waitUntil(
    self.registration.showNotification(data.title || 'Mein Bücherregal', {
      body: data.body || '',
      icon: scope + 'icon-192.png',
      badge: scope + 'icon-192.png',
      tag: data.tag,
      data: { url: scope },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
