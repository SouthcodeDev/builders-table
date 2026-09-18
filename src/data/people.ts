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

/** Demo 2's deck order and reason lines. Pre-written — the deck never calls the model. */
export const ACTIVE_RANKED: { eventId: string; reason: string }[] = [
  { eventId: 'ct-golden-hour-6k', reason: 'Early miles, then coffee — the usual shape of your day.' },
  { eventId: 'ct-contour-path', reason: 'Another early outdoor start, which you keep saying yes to.' },
  { eventId: 'ct-woodstock-open-studio', reason: 'Starts within the hour, and it is practically next door.' },
  { eventId: 'ct-oranjezicht-market', reason: 'Coffee and produce with the mountain right there.' },
  { eventId: 'ct-obz-open-mic', reason: 'For the nights you stay out past nine.' },
  { eventId: 'ct-kalk-bay-swim', reason: 'Cold water is a big ask. It is here anyway.' },
]

/** Who else is going to what — drives the avatar stacks on Discover and Event detail. */
export const ATTENDANCE: Record<string, string[]> = {
  'ct-golden-hour-6k': ['nandi', 'thabo', 'aisha'],
  'ct-obz-open-mic': ['thabo'],
  'ct-oranjezicht-market': ['aisha'],
}

/** Total head-count fiction for judge mode, where no friends exist. */
export const ATTENDANCE_BASE: Record<string, number> = {
  'ct-golden-hour-6k': 14,
  'ct-woodstock-open-studio': 9,
  'ct-kalk-bay-swim': 6,
  'ct-obz-open-mic': 22,
  'ct-oranjezicht-market': 30,
  'ct-contour-path': 11,
}

/** Ameer's device sees this instead of Sam's plans. */
export const AMEER_PLANS: Omit<Plan, 'createdAtMs'>[] = [
  { id: 'ameer-plan-1', placeId: 'ct-golden-hour-6k', withPeople: [], status: 'going' },
]

/** Demo 2's existing schedule. createdAtMs is filled at load — see seed.ts. */
export const ACTIVE_PLANS: Omit<Plan, 'createdAtMs'>[] = [
  { id: 'plan-1', placeId: 'ct-golden-hour-6k', withPeople: ['nandi', 'thabo'], status: 'going' },
  { id: 'plan-2', placeId: 'ct-obz-open-mic', withPeople: [], status: 'going' },
  { id: 'plan-3', placeId: 'ct-oranjezicht-market', withPeople: ['aisha'], status: 'going' },
  { id: 'plan-4', placeId: 'ct-kalk-bay-swim', withPeople: [], status: 'saved' },
]

export const ACTIVE_PASSPORT: Passport = {
  stats: { places: 31, withFriends: 9, cities: 2 },
  note: 'Four Fridays in a row you went outside.',
  stamps: [
    { title: 'Golden hour 6k', dateLabel: 'Sep 12', image: '/images/golden-hour-6k.jpg' },
    { title: 'Contour path', dateLabel: 'Sep 06', image: '/images/contour-path.jpg' },
    { title: 'Bo-Kaap market', dateLabel: 'Aug 31', image: '/images/oranjezicht-market.jpg' },
    { title: 'Izakaya alley', dateLabel: 'Aug 24', image: '/images/shimokita-records.jpg' },
    { title: 'Long table', dateLabel: 'Aug 17', image: '/images/nakameguro-coffee.jpg' },
    { title: 'Four bands', dateLabel: 'Aug 09', image: '/images/obz-open-mic.jpg' },
  ],
  stampsMore: 25,
  nextStamp: { title: 'Golden hour 6k', when: 'Tonight 18:30' },
}
