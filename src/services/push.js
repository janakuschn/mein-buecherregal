// Push-Mitteilungen (Rückgabe-Erinnerungen für geliehene Bücher).
// Der Server-Teil liegt in supabase/functions/borrow-reminders.
//
// iOS: funktioniert nur in der App vom Homescreen (nicht im Safari-Tab) und
// die Erlaubnis darf nur direkt nach einem Tipp abgefragt werden - deshalb
// wird enablePush() beim Antippen von "Geliehen" aufgerufen.
import { supabase } from './supabase'

// Öffentlicher VAPID-Schlüssel (darf öffentlich sein). Der private Teil liegt
// als Secret in Supabase (VAPID_PRIVATE_KEY).
const VAPID_PUBLIC_KEY = 'BIBANKg9NfFeX8xt9CmLwLbj7ygpzZRA4J3y1lFT4nRbtA014MRXqdQmDLpitylcLvs2lhIkLOmndOWHkY7PTbg'

function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
    .catch((err) => console.warn('[Push] Service Worker nicht registriert:', err))
}

async function saveSubscription(sub) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const json = sub.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: 'endpoint' }
  )
  if (error) console.warn('[Push] Abo nicht gespeichert:', error)
}

// Fragt (falls nötig) die Erlaubnis ab und meldet das Gerät an.
// Rückgabe: 'ok' | 'unsupported' | 'denied'
export async function enablePush() {
  if (!pushSupported()) return 'unsupported'
  // requestPermission() muss als ERSTES im Tipp-Handler laufen (iOS).
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission
  if (permission !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
      })
    }
    await saveSubscription(sub)
    return 'ok'
  } catch (err) {
    console.warn('[Push] Anmeldung fehlgeschlagen:', err)
    return 'unsupported'
  }
}

// Beim App-Start: wenn schon erlaubt, Abo still auffrischen (iOS tauscht
// Abos gelegentlich aus).
export function refreshPushIfGranted() {
  if (pushSupported() && Notification.permission === 'granted') enablePush()
}
