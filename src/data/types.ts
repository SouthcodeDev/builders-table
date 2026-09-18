import type { Tag } from './vocab'

export type City = 'cape-town' | 'tokyo'

export type CityMeta = {
  id: City
  label: string
  tz: string // IANA
  center: { lat: number; lng: number }
  zoom: number
  areas: string[] // fixed list — powers area filtering with NO geocoding API
}

export const CITIES: Record<City, CityMeta> = {
  'cape-town': {
    id: 'cape-town',
    label: 'Cape Town',
    tz: 'Africa/Johannesburg',
    // Woodstock — the venue, and the geolocation-denied fallback centre.
    center: { lat: -33.927, lng: 18.447 },
    zoom: 12.2,
    areas: [
      'Woodstock', 'Observatory', 'Salt River', 'City Bowl', 'Sea Point',
      'Green Point', 'Gardens', 'Kalk Bay', 'Muizenberg', 'Oranjezicht',
      'Table Mountain', 'Bo-Kaap',
    ],
  },
  tokyo: {
    id: 'tokyo',
    label: 'Tokyo',
    tz: 'Asia/Tokyo',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 11.5,
    areas: [
      'Shibuya', 'Shinjuku', 'Nakameguro', 'Shimokitazawa', 'Asakusa',
      'Kichijoji', 'Yanaka', 'Daikanyama',
    ],
  },
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------
// NEVER store an absolute timestamp for an event start. You build on Friday and
// pitch on Saturday; every event would silently be in the past.
//
//   offset — "starts in N minutes from right now". Use for the happening-now card.
//   clock  — the next occurrence of a wall-clock time in the PLACE's timezone.
//            dayOffset 0 = today (rolls to tomorrow if already past), 1 = tomorrow.

export type Schedule =
  | { kind: 'offset'; minutes: number }
  | { kind: 'clock'; dayOffset: number; hour: number; minute: number }

export type Place = {
  id: string
  city: City
  area: string
  /** 'event' has a start time and can go in Plans. 'place' is always-on. */
  kind: 'event' | 'place'
  title: string
  /** One or two sentences. Rendered verbatim — the model never rewrites this. */
  blurb: string
  lat: number
  lng: number
  schedule: Schedule
  durationMin: number
  /** Display string: 'Free', 'R60', '¥1,500'. null = not applicable. */
  price: string | null
  tags: Tag[]
  /** Local path under /public. Never a remote URL. */
  image: string
  /** Unsplash photographer name — licence condition. */
  imageCredit: string
  /** Where "Let's go Places" sends you, if different from the pin. */
  mapsLat?: number
  mapsLng?: number
  /** Reference link from curation. Not rendered; kept so you can re-verify. */
  sourceUrl?: string
}

export type Person = {
  id: string
  name: string
  initials: string
  area: string
  /** Shown under their name in the invite sheet: 'Ran this last week'. */
  note: string
}

export type Persona = {
  label: string
  sentence: string
  tags: Tag[]
}

/** Stored result of the single /api/persona call. */
export type PersonaResult = Persona & {
  ranked: { eventId: string; reason: string }[]
  /** true when the model call failed and local tag-overlap ranking was used. */
  fallback: boolean
}

export type Plan = {
  id: string
  placeId: string
  /** Person ids. Empty = going alone, which is fine and the copy says so. */
  withPeople: string[]
  note?: string
  status: 'going' | 'saved'
  createdAtMs: number
}

export type Invite = {
  id: string
  fromUser: string
  toUser: string
  placeId: string
  note: string
  createdAtMs: number
}

export type PassportStamp = { label: string; since: string; detail: string }

export type Passport = {
  stats: { places: number; events: number; cities: number; peopleMet: number }
  stamps: PassportStamp[]
  areas: string[]
  communities: string[]
}

export type Mode = 'judge' | 'active'
