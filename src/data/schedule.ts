import type { Place, Schedule } from '@/data/types'
import { CITIES } from '@/data/types'

/**
 * DEMO_NOW — the single time anchor.
 *
 * Normally real time, so "starts in 22 minutes" is true whenever the app opens.
 * Set NEXT_PUBLIC_DEMO_NOW to an ISO string to pin the clock for rehearsal.
 */
export function demoNow(): Date {
  const pinned = process.env.NEXT_PUBLIC_DEMO_NOW
  return pinned ? new Date(pinned) : new Date()
}

/** UTC offset of an IANA zone at a given instant, in minutes. */
function zoneOffsetMin(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]))
  const asUTC = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour), Number(p.minute), Number(p.second),
  )
  return (asUTC - at.getTime()) / 60000
}

/** Resolve a schedule to a real instant. */
export function startOf(place: Place, now = demoNow()): Date {
  return resolve(place.schedule, CITIES[place.city].tz, now)
}

function resolve(s: Schedule, tz: string, now: Date): Date {
  if (s.kind === 'offset') return new Date(now.getTime() + s.minutes * 60000)

  // Wall-clock time in the place's timezone, on now + dayOffset days.
  const off = zoneOffsetMin(tz, now)
  const local = new Date(now.getTime() + off * 60000)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth()
  const d = local.getUTCDate() + s.dayOffset
  let utcMs = Date.UTC(y, m, d, s.hour, s.minute) - off * 60000
  // dayOffset 0 and already past → roll to tomorrow, so nothing is ever stale.
  if (s.dayOffset === 0 && utcMs < now.getTime()) utcMs += 86400000
  return new Date(utcMs)
}

export function minutesUntil(place: Place, now = demoNow()): number {
  return Math.round((startOf(place, now).getTime() - now.getTime()) / 60000)
}

/** Format in the PLACE's local time, 12-hour with am/pm. A Tokyo event shows Tokyo time, deliberately. */
export function formatLocal(place: Place, now = demoNow()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CITIES[place.city].tz,
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(startOf(place, now))
}

/**
 * For always-on places (cafés, studios), the displayed time is the CLOSING time.
 * There is no closing column in the CSV yet — closing is derived as opening +
 * durationMin. Made-up numbers for now; swap for a real column when curation adds one.
 */
export function closingLabel(place: Place, now = demoNow()): string {
  const close = new Date(startOf(place, now).getTime() + place.durationMin * 60000)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CITIES[place.city].tz,
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(close)
}

/** The time slot a card shows: start time for events, closing time for places. */
export function timeLabel(place: Place, now = demoNow()): string {
  return place.kind === 'place' ? `Closes ${closingLabel(place, now)}` : formatLocal(place, now)
}

export function formatDayLabel(place: Place, now = demoNow()): string {
  const tz = CITIES[place.city].tz
  const day = (dt: Date) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit', month: '2-digit' }).format(dt)
  const start = startOf(place, now)
  if (day(start) === day(now)) return 'Tonight'
  if (day(start) === day(new Date(now.getTime() + 86400000))) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short' })
    .format(start).toUpperCase()
}

/** True for the happening-now card that drives the closing beat. */
export function isStartingSoon(place: Place, withinMin = 45, now = demoNow()): boolean {
  const m = minutesUntil(place, now)
  return m >= 0 && m <= withinMin
}

/** Weekday name in a city's tz — "Friday". */
export function weekday(tz: string, now = demoNow()): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(now)
}

/** Part of day in a city's tz — header greeter. */
export function daypart(tz: string, now = demoNow()): 'morning' | 'afternoon' | 'evening' {
  const h = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(now),
  )
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
