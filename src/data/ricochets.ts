// ricochets.ts — a day, chained. Someone else already worked out the order.
//
// SEED IS TRUTH (§1.5). A ricochet stores nothing but place IDs, a time and a line of
// the author's own advice. Titles, addresses, photos and coordinates are all read
// back off the place, so a ricochet can never disagree with the curated set — and the
// "4.2 km end to end" on the detail screen is computed from real coordinates, never
// typed in.

import type { City } from './types'

export type RicochetStop = {
  placeId: string
  /** Wall-clock label in the PLACE's city. Authored, not scheduled. */
  time: string
  /** How you get here from the stop before. Omitted on the first stop. */
  travel?: string
  /** The author's advice. The one thing here that isn't derived from seed. */
  note: string
}

export type Ricochet = {
  id: string
  title: string
  /** 'day' is your own city; 'trip' spans more than one. Same object either way. */
  kind: 'day' | 'trip'
  city: City
  authorName: string
  authorInitials: string
  /** Social proof on the card. Fiction, like the rest of Demo 2. */
  savedCount: number
  /** Short all-caps chips on the list card, e.g. EAT · SURF · EAT. */
  shape: string[]
  stops: RicochetStop[]
  /** Cover art. A place photo from the seed, never a new asset. */
  image: string
  /** True for ones the user chained themselves — drives the "Yours" tab. */
  mine?: boolean
}

export const RICOCHETS: Ricochet[] = [
  {
    id: 'ric-muizenberg-loop',
    title: 'The Muizenberg loop',
    kind: 'day',
    city: 'cape-town',
    authorName: 'Nadia Mokoena',
    authorInitials: 'NM',
    savedCount: 214,
    shape: ['ONE DAY', 'CLEAN · SURF · WALK'],
    image: '/images/garys-surf.jpg',
    stops: [
      {
        placeId: 'ct-trash-bash',
        time: '08:00',
        note: 'Start on the sand before the wind comes up. Gloves and bags are handed out.',
      },
      {
        placeId: 'ct-garys-surf-school',
        time: '09:30',
        travel: '4 min walk',
        note: "Surfers Corner is two minutes up the beach. Wetsuit's included, don't buy one.",
      },
      {
        placeId: 'ct-silvermine',
        time: '13:00',
        travel: '12 min drive',
        note: 'Dry off on the climb. Flat loop round the reservoir with the whole peninsula either side.',
      },
    ],
  },
  {
    id: 'ric-woodstock-making',
    title: 'Woodstock, making things',
    kind: 'day',
    city: 'cape-town',
    authorName: 'Thabo Sithole',
    authorInitials: 'TS',
    savedCount: 22,
    shape: ['ONE DAY', 'COFFEE · CLAY · DIRT'],
    image: '/images/clay-hands.jpg',
    stops: [
      {
        placeId: 'ct-truth-coffee',
        time: '09:00',
        note: 'Go before ten or you queue. Sit upstairs where you can see the roaster.',
      },
      {
        placeId: 'ct-clay-hands',
        time: '11:00',
        travel: '8 min drive',
        note: "Two hours at the wheel. You'll make something wonky. Keep it anyway.",
      },
      {
        placeId: 'ct-greenpop',
        time: '14:00',
        travel: '5 min walk',
        note: 'Same four blocks. Wear the shoes you already ruined at the wheel.',
      },
    ],
  },
  {
    id: 'ric-city-bowl-slow',
    title: 'Slow Saturday, City Bowl',
    kind: 'day',
    city: 'cape-town',
    authorName: 'Aisha Karim',
    authorInitials: 'AK',
    savedCount: 91,
    shape: ['ONE DAY', 'EAT · ART · EAT'],
    image: '/images/zeitz-mocaa.jpg',
    stops: [
      {
        placeId: 'ct-the-ladder',
        time: '09:30',
        note: 'Long breakfast on Bree. Nobody will rush you off the table.',
      },
      {
        placeId: 'ct-zeitz-mocaa',
        time: '11:30',
        travel: '12 min walk',
        note: 'Atrium first, then work down. Two hours goes faster than you think.',
      },
      {
        placeId: 'ct-mulberry-prince',
        time: '19:00',
        travel: '10 min walk',
        note: 'Book ahead — small room, short menu, and it changes.',
      },
    ],
  },
  {
    id: 'ric-tokyo-two-days',
    title: 'Two days in Tokyo',
    kind: 'trip',
    city: 'tokyo',
    authorName: 'Amy Chen',
    authorInitials: 'AC',
    savedCount: 91,
    shape: ['TRIP', '2 DAYS'],
    image: '/images/tokyo-placeholder-1.jpg',
    stops: [
      {
        placeId: 'tk-placeholder-coffee',
        time: '09:00',
        note: 'Placeholder note — replace with the real Tokyo curation.',
      },
      {
        placeId: 'tk-placeholder-making',
        time: '11:00',
        travel: '20 min train',
        note: 'Placeholder note — replace with the real Tokyo curation.',
      },
      {
        placeId: 'tk-placeholder-shows',
        time: '20:00',
        travel: '25 min train',
        note: 'Placeholder note — replace with the real Tokyo curation.',
      },
    ],
  },
]

export const ricochetById = (id: string): Ricochet | undefined =>
  RICOCHETS.find((r) => r.id === id)
