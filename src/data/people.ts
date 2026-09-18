// people.ts — authored fiction for Demo 2 (the "active user" door).
//
// Sam Mbeki is a character you are writing, not a simulation. None of this is
// generated, none of it is stored anywhere, none of it calls the model.
//
// Demo 1 (the judge door) uses NONE of this. The judge has no friends, no plans
// and no passport, and every socially-loaded component needs to survive that.

import type { Person, Persona, Plan, Passport } from './types'

export const ME_ACTIVE = {
  id: 'sam',
  name: 'Sam Mbeki',
  initials: 'SM',
  city: 'cape-town' as const,
  since: 'March',
}

/** Hard-coded demo identities for the cross-device invite. No auth, no handles. */
export const DEVICE_USERS = {
  hishaam: { id: 'hishaam', name: 'Hishaam', initials: 'HK' },
  ameer: { id: 'ameer', name: 'Ameer', initials: 'AM' },
} as const

export const FRIENDS: Person[] = [
  { id: 'nandi', name: 'Nandi Mokoena', initials: 'NM', area: 'Sea Point', note: 'Already going' },
  { id: 'thabo', name: 'Thabo Sithole', initials: 'TS', area: 'Observatory', note: 'Ran this last week' },
  { id: 'aisha', name: 'Aisha Karim', initials: 'AK', area: 'Green Point', note: 'Lives in Green Point' },
  // Ameer sits in the friend list so the live cross-device invite has a real target.
  { id: 'ameer', name: 'Ameer', initials: 'AM', area: 'Woodstock', note: 'In the room' },
]

export const personById = (id: string): Person | undefined =>
  FRIENDS.find((p) => p.id === id)

/** Demo 2's persona. Pre-written. Does NOT call /api/persona. */
export const ACTIVE_PERSONA: Persona = {
  label: 'Runner',
  sentence:
    "You keep choosing the ones that start outdoors and end with your legs aching. Noted.",
  tags: ['running', 'outdoors', 'coffee', 'live-music'],
}

/** Who else is going to what — drives the avatar stacks on Discover and Event detail. */
export const ATTENDANCE: Record<string, string[]> = {
  'ct-golden-hour-6k': ['nandi', 'thabo', 'aisha'],
  'ct-obz-open-mic': ['thabo'],
  'ct-oranjezicht-market': ['aisha'],
}

/** Demo 2's existing schedule. createdAtMs is filled at load — see seed.ts. */
export const ACTIVE_PLANS: Omit<Plan, 'createdAtMs'>[] = [
  { id: 'plan-1', placeId: 'ct-golden-hour-6k', withPeople: ['nandi', 'thabo'], status: 'going' },
  { id: 'plan-2', placeId: 'ct-obz-open-mic', withPeople: [], status: 'going' },
  { id: 'plan-3', placeId: 'ct-oranjezicht-market', withPeople: ['aisha'], status: 'going' },
  { id: 'plan-4', placeId: 'ct-kalk-bay-swim', withPeople: [], status: 'saved' },
]

export const ACTIVE_PASSPORT: Passport = {
  stats: { places: 34, events: 21, cities: 3, peopleMet: 47 },
  stamps: [
    { label: 'Runner', since: 'SINCE SEP', detail: '3 runs in · 2 suburbs · 18:30 usual hour' },
    { label: 'Night owl', since: 'SINCE JUN', detail: 'Most of your yeses start after 20:00' },
    { label: 'Explorer', since: 'SINCE APR', detail: 'Six suburbs you had never been to' },
  ],
  areas: ['Kalk Bay', 'Observatory', 'Sea Point', 'Woodstock', 'Table Mountain', 'Muizenberg'],
  communities: ['Sea Point Runners', 'Obz Open Mic'],
}
