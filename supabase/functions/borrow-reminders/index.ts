// Rückgabe-Erinnerungen für geliehene Bücher (Push an die PWA).
//
// Wird per pg_cron stündlich aufgerufen (siehe supabase/push_reminders.sql).
// Ab 9 Uhr (Europe/Berlin) gehen Erinnerungen raus für Bücher, die in 3
// Tagen bzw. morgen zurückgegeben werden müssen und noch nicht als
// "Zurückgegeben" markiert sind. Die Tabelle borrow_reminders_sent
// verhindert doppelte Mitteilungen, egal wie oft die Funktion läuft.
//
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// Deploy: npx supabase functions deploy borrow-reminders --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const SEND_FROM_HOUR = 9
const DAYS_BEFORE = [3, 1]

function berlinNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) }
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDe(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })

Deno.serve(async () => {
  const { date, hour } = berlinNow()
  if (hour < SEND_FROM_HOUR) return json({ skipped: 'vor 9 Uhr', date, hour })

  if (!Deno.env.get('VAPID_PRIVATE_KEY')) return json({ error: 'VAPID-Secrets fehlen' })
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!
  )
  // Service-Key: klassisch SUPABASE_SERVICE_ROLE_KEY, bei neuen API-Keys
  // ggf. nur SUPABASE_SECRET_KEYS (JSON) - beides abdecken.
  let serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceKey) {
    try {
      serviceKey = Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}'))[0] as string
    } catch {
      /* leer lassen */
    }
  }
  if (!serviceKey) return json({ error: 'Kein Service-Key verfügbar' })
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

  const dueToDaysBefore = new Map(DAYS_BEFORE.map((n) => [addDays(date, n), n]))
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, user_id, borrowed_until')
    .in('borrowed_until', [...dueToDaysBefore.keys()])
    .is('borrowed_returned_at', null)
  if (error) return json({ error: error.message })

  const results = []
  for (const book of books ?? []) {
    const daysBefore = dueToDaysBefore.get(book.borrowed_until)!

    // Erst eintragen, dann senden: lieber einmal zu wenig als doppelt.
    const { error: logError } = await supabase.from('borrow_reminders_sent').insert({
      book_id: String(book.id),
      due_date: book.borrowed_until,
      days_before: daysBefore,
    })
    if (logError) {
      results.push({ book: book.title, skipped: 'schon gesendet' })
      continue
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', book.user_id)

    const payload = JSON.stringify({
      title: daysBefore === 1 ? 'Morgen zurückgeben' : 'In 3 Tagen zurückgeben',
      body: `„${book.title}“ bitte bis ${formatDe(book.borrowed_until)} zurückgeben.`,
      tag: `borrow-${book.id}-${daysBefore}`,
    })

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60 * 12 }
        )
        results.push({ book: book.title, sent: true })
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        // Abo abgelaufen (App gelöscht o.ä.) -> aufräumen.
        if (status === 404 || status === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        results.push({ book: book.title, error: String(status ?? err) })
      }
    }
  }
  return json({ date, hour, results })
})
