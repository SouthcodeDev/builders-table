// business.ts — authored fiction for the "I'm a business" door.
//
// Tiger's Milk Muizenberg. Every number here is spoofed, exactly as the Phase-4
// handoff says it should be ("Spoofed numbers throughout"). None of it is real
// analytics, none of it calls the model, none of it touches the database.
//
// The consumer seed never imports this file. These events are NOT in PLACES, so
// they cannot leak into the consumer feed — only an event created live in the app
// becomes a real Place (see src/state/places.tsx).

import type { Place, Schedule } from './types'
import type { InterestTag } from './vocab'
import { formatDayLabel, formatLocal } from './schedule'

export const BUSINESS = {
  id: 'tigers-milk',
  name: "Tiger's Milk",
  initials: 'TM',
  area: 'Muizenberg',
  city: 'cape-town' as const,
  verifiedLabel: 'Muizenberg · verified',
  /**
   * Surfers Corner. Lifted verbatim from the curated Muizenberg rows in places.ts
   * (ct-garys-surf-school / ct-trash-bash) rather than geocoded or invented —
   * AGENTS.md §2.7. Every event this business creates drops a pin here.
   */
  lat: -34.103,
  lng: 18.47,
  address: 'Surfers Corner, Beach Rd, Muizenberg',
  stats: [
    { value: '1,284', label: 'Saw you' },
    { value: '216', label: 'Said yes' },
    { value: '17%', label: 'Turned up', accent: true },
  ],
} as const

export type BizEvent = {
  id: string
  title: string
  image: string
  /** Live events resolve against DEMO_NOW like everything else (§1.5). */
  schedule?: Schedule
  /** Past events already happened, so they carry a fixed label instead. */
  dateLabel?: string
  interested: number
  going: number
  turnedUp?: number
  seats?: number
  maybe?: number
}

export const BIZ_LIVE: BizEvent[] = [
  {
    id: 'tm-sunset-supper',
    title: 'Sunset supper club',
    image: '/images/hussar-grill.jpg',
    schedule: { kind: 'clock', dayOffset: 0, hour: 18, minute: 30 },
    interested: 64,
    going: 41,
    seats: 70,
    maybe: 14,
  },
  {
    id: 'tm-sunrise-paddle',
    title: 'Sunrise paddle + coffee',
    image: '/images/kayak-adventures.jpg',
    schedule: { kind: 'clock', dayOffset: 4, hour: 7, minute: 0 },
    interested: 23,
    going: 9,
  },
]

export const BIZ_PAST: BizEvent[] = [
  {
    id: 'tm-long-table',
    title: 'Long table, 12 Sep',
    image: '/images/faeezas-kitchen.jpg',
    dateLabel: '12 Sep',
    interested: 180,
    going: 63,
    turnedUp: 58,
  },
]

export const bizEventById = (id: string): BizEvent | undefined =>
  [...BIZ_LIVE, ...BIZ_PAST].find((e) => e.id === id)

/**
 * When a dashboard row happens. Relative to DEMO_NOW for live rows (§1.5); past
 * rows carry a fixed label because they already happened.
 *
 * ponytail: the cast is safe and contained — formatDayLabel/formatLocal read only
 * .city and .schedule. Give BizEvent the full Place shape if they ever need more.
 */
export function bizWhen(e: BizEvent): string {
  if (!e.schedule) return e.dateLabel ?? ''
  const p = { city: BUSINESS.city, schedule: e.schedule } as Place
  return `${formatDayLabel(p)} ${formatLocal(p)}`.toUpperCase()
}

/** A live-created event, dressed as a dashboard row. Figures spoofed, but stable. */
export function placeToBizEvent(place: Place): BizEvent {
  const going = seededInt(place.id, 21, 8, 52)
  return {
    id: place.id,
    title: place.title,
    image: place.image,
    schedule: place.schedule,
    interested: going + seededInt(place.id, 22, 6, 40),
    going,
    seats: seededInt(place.id, 23, 56, 90),
    maybe: seededInt(place.id, 24, 4, 20),
  }
}

// ---------------------------------------------------------------------------
// The report (handoff screen 33)
// ---------------------------------------------------------------------------

export type BizReport = {
  turnUpRate: string
  impressions: string
  savedRate: string
  /** Eight bars: seven days out, then the day itself. */
  byDay: number[]
  peakLabel: string
  whoCame: { label: string; pct: number; tone: string }[]
  nextMove: string
}

/** Stable pseudo-random from an id, so a created event's figures never reshuffle. */
function seededInt(id: string, salt: number, min: number, max: number): number {
  let h = salt * 2654435761
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return min + (h % (max - min + 1))
}

const NEXT_MOVES = [
  'Thursdays out-perform Fridays for you by a third. Same table, one night earlier.',
  'Half your yeses came from inside 2 km. Worth putting a board on the pavement.',
  'People who came with a friend stayed nearly an hour longer. Price a pair.',
  'You filled up four days out. Open the doors a week ahead next time.',
]

export function reportFor(event: BizEvent): BizReport {
  const turnedUp = event.turnedUp ?? Math.round(event.going * 0.88)
  const rate = event.going > 0 ? Math.round((turnedUp / event.going) * 100) : 0
  const impressions = seededInt(event.id, 1, 900, 2400)
  const peakIndex = seededInt(event.id, 2, 4, 6)

  const byDay = Array.from({ length: 8 }, (_, i) => {
    if (i === peakIndex) return 100
    const drop = Math.abs(i - peakIndex)
    return Math.max(14, seededInt(event.id, 10 + i, 16, 82) - drop * 6)
  })

  return {
    turnUpRate: `${rate}%`,
    impressions: impressions.toLocaleString('en-GB'),
    savedRate: `${(seededInt(event.id, 3, 18, 52) / 10).toFixed(1)}%`,
    byDay,
    peakLabel: `Peaked ${8 - peakIndex - 1} days out`,
    whoCame: [
      { label: 'Within 5 km', pct: seededInt(event.id, 4, 58, 84), tone: 'bg-hero' },
      { label: 'With a friend', pct: seededInt(event.id, 5, 42, 72), tone: 'bg-hero' },
      { label: 'First time', pct: seededInt(event.id, 6, 24, 52), tone: 'bg-pop' },
      { label: 'Via a ricochet', pct: seededInt(event.id, 7, 12, 34), tone: 'bg-teal' },
    ],
    nextMove: NEXT_MOVES[seededInt(event.id, 8, 0, NEXT_MOVES.length - 1)],
  }
}

// ---------------------------------------------------------------------------
// Putting something on
// ---------------------------------------------------------------------------

/** "The shape of it" chips. Interest tags, so the new event ranks like any other. */
export const SHAPE_CHIPS: { tag: InterestTag; label: string }[] = [
  { tag: 'food', label: 'Food' },
  { tag: 'outdoors', label: 'Outdoors' },
  { tag: 'social', label: 'Slow evening' },
  { tag: 'live-shows', label: 'Loud night' },
  { tag: 'wellness', label: 'Solo-friendly' },
]

/** The "Replace" strip. Repo images only — image upload is out of scope (§1.9). */
export const PHOTO_CHOICES = [
  '/images/hussar-grill.jpg',
  '/images/mulberry-prince.jpg',
  '/images/faeezas-kitchen.jpg',
  '/images/happy-uncles.jpg',
  '/images/the-barn.jpg',
  '/images/kayak-adventures.jpg',
  '/images/garys-surf.jpg',
  '/images/chefs-studio.jpg',
] as const

export type EventDraft = {
  title: string
  line: string
  dayOffset: number
  hour: number
  minute: number
  tags: InterestTag[]
  seats: string
  price: string
  image: string
}

export const EMPTY_DRAFT: EventDraft = {
  title: '',
  line: '',
  dayOffset: 0,
  hour: 18,
  minute: 30,
  tags: [],
  seats: '',
  price: '',
  image: PHOTO_CHOICES[0],
}

/** Draft → a real Place. Same shape as any curated row, so every screen renders it. */
export function draftToPlace(draft: EventDraft, id: string): Place {
  return {
    id,
    city: BUSINESS.city,
    area: BUSINESS.area,
    kind: 'event',
    title: draft.title.trim() || 'Untitled',
    blurb: draft.line.trim() || `On at ${BUSINESS.name}.`,
    address: BUSINESS.address,
    lat: BUSINESS.lat,
    lng: BUSINESS.lng,
    schedule: {
      kind: 'clock',
      dayOffset: draft.dayOffset,
      hour: draft.hour,
      minute: draft.minute,
    },
    durationMin: 120,
    price: draft.price.trim() || null,
    tags: draft.tags.length > 0 ? draft.tags : ['food'],
    image: draft.image,
    imageCredit: BUSINESS.name,
  }
}

/** Spoofed reach line under the form. Moves as you tag, which is the whole point. */
export const reachEstimate = (tagCount: number): number =>
  300 + tagCount * 300
