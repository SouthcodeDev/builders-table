// seed.ts — the single import surface for all curated data.
// Components import from here, never from the individual files.

export * from './types'
export * from './vocab'
export { PLACES } from './places'
// placeById resolves business-created events too — see registry.ts
export { placeById, registerPlaces, extraPlaces } from './registry'
export {
  ME_ACTIVE, DEVICE_USERS, FRIENDS, personById, ACTIVE_PERSONA, ACTIVE_RANKED,
  ATTENDANCE, ATTENDANCE_BASE, AMEER_PLANS, ACTIVE_PLANS, ACTIVE_PASSPORT,
} from './people'
export { COPY } from './copy'
export * from './business'
export {
  demoNow, startOf, minutesUntil, formatLocal, formatDayLabel, isStartingSoon,
  daypart, weekday, weekdayOf, clock24, timeLabel, closingLabel,
} from './schedule'
export { distanceKm, formatDistance, directionsUrl } from './geo'
export { categoryFor, CATEGORY_KEYS, type Category } from './categories'
export { LEVELS, levelFor, collection, type LevelDef, type LevelState } from './levels'
export { RICOCHETS, ricochetById, type Ricochet, type RicochetStop } from './ricochets'
export { MARKER_ICONS } from './marker-icons'

import { PLACES } from './places'
import { ACTIVE_PLANS } from './people'
import type { City, Plan } from './types'

export const placesIn = (city: City) => PLACES.filter((p) => p.city === city)

export const areasIn = (city: City) =>
  Array.from(new Set(PLACES.filter((p) => p.city === city).map((p) => p.area))).sort()

/** Demo 2's plans, timestamped at load. */
export const activePlans = (): Plan[] =>
  ACTIVE_PLANS.map((p, i) => ({ ...p, createdAtMs: Date.now() - (i + 1) * 3600_000 }))

/** localStorage keys. One place, so nothing gets orphaned. */
export const STORAGE = {
  mode: 'places.mode',
  user: 'places.user',
  interests: 'places.interests',
  persona: 'places.persona',
  personaLoading: 'places.personaLoading',
  plans: 'places.plans',
  deckPicks: 'places.deckPicks',
  city: 'places.city',
  area: 'places.area',
  radius: 'places.radius',
  invites: 'places.invites',
  device: 'places.device',
  tab: 'places.tab',
  myEvents: 'places.myEvents',
  draft: 'places.draft',
  ricochets: 'places.ricochets',
  stampPhotos: 'places.stampPhotos',
} as const
