// seed.ts — the single import surface for all curated data.
// Components import from here, never from the individual files.

export * from './types'
export * from './vocab'
export { PLACES, placeById } from './places'
export {
  ME_ACTIVE, DEVICE_USERS, FRIENDS, personById, ACTIVE_PERSONA,
  ATTENDANCE, ACTIVE_PLANS, ACTIVE_PASSPORT,
} from './people'
export { COPY } from './copy'

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
  persona: 'places.persona',
  plans: 'places.plans',
  deckSeen: 'places.deckSeen',
  city: 'places.city',
} as const
