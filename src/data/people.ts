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
  tags: ['running', 'outdoors', 'coffee', 'live-shows'],
}

/** Demo 2's deck order and reason lines. Pre-written — the deck never calls the model. */
export const ACTIVE_RANKED: { eventId: string; reason: string }[] = [
  { eventId: 'ct-run-promenade', reason: 'Your usual hour, and the promenade after — the easy yes.' },
  { eventId: 'ct-kloof-corner', reason: 'Golden hour on the mountain — early starts keep showing up for you.' },
  { eventId: 'ct-clay-hands', reason: 'Starts within the hour, and it is walking distance from here.' },
  { eventId: 'ct-sanlam-marathon', reason: 'The big one. You keep circling races like this.' },
  { eventId: 'ct-newlands-forest', reason: 'Another early one through the trees.' },
  { eventId: 'ct-flow-lab', reason: 'A Friday reset before the weekend takes over.' },
  { eventId: 'ct-first-thursdays', reason: 'For the nights you stay out on the streets.' },
  { eventId: 'ct-silvermine', reason: 'A longer walk, if the morning is free.' },
]

/** Who else is going to what — drives the avatar stacks on Discover and Event detail. */
export const ATTENDANCE: Record<string, string[]> = {
  'ct-run-promenade': ['nandi', 'thabo', 'aisha'],
  'ct-obz-quiz-night': ['thabo'],
  'ct-first-thursdays': ['aisha'],
}

/** Total head-count fiction for judge mode, where no friends exist. */
export const ATTENDANCE_BASE: Record<string, number> = {
  'ct-run-promenade': 14,
  'ct-clay-hands': 9,
  'ct-obz-quiz-night': 22,
  'ct-first-thursdays': 30,
  'ct-sanlam-marathon': 40,
  'ct-kloof-corner': 11,
}

/** Ameer's device sees this instead of Sam's plans. */
export const AMEER_PLANS: Omit<Plan, 'createdAtMs'>[] = [
  { id: 'ameer-plan-1', placeId: 'ct-run-promenade', withPeople: [], status: 'going' },
]

/** Demo 2's existing schedule. createdAtMs is filled at load — see seed.ts. */
export const ACTIVE_PLANS: Omit<Plan, 'createdAtMs'>[] = [
  { id: 'plan-1', placeId: 'ct-run-promenade', withPeople: ['nandi', 'thabo'], status: 'going' },
  { id: 'plan-2', placeId: 'ct-obz-quiz-night', withPeople: [], status: 'going' },
  { id: 'plan-3', placeId: 'ct-first-thursdays', withPeople: ['aisha'], status: 'going' },
  { id: 'plan-4', placeId: 'ct-garys-surf-school', withPeople: [], status: 'saved' },
]

export const ACTIVE_PASSPORT: Passport = {
  stats: { places: 31, withFriends: 9, cities: 2 },
  note: 'Four Fridays in a row you went outside.',
  stamps: [
    { title: 'Run the promenade', dateLabel: 'Sep 12', image: '/images/run-promenade.jpg' },
    { title: 'Kloof Corner', dateLabel: 'Sep 06', image: '/images/kloof-corner.jpg' },
    { title: 'First Thursdays', dateLabel: 'Aug 31', image: '/images/first-thursdays.jpg' },
    { title: 'Clay Hands', dateLabel: 'Aug 24', image: '/images/clay-hands.jpg' },
    { title: 'Flow Lab', dateLabel: 'Aug 17', image: '/images/flow-lab.jpg' },
    { title: 'Quiz night in Obz', dateLabel: 'Aug 09', image: '/images/obz-quiz.jpg' },
  ],
  stampsMore: 25,
  nextStamp: { title: 'Run the promenade', when: 'Tonight 18:00' },
}
