// places.ts — GENERATED from data/places.csv by scripts/build-places.mjs
//
// Do not hand-edit once the CSV is live: run `node scripts/build-places.mjs` instead.
// The rows below are EXAMPLES so the app compiles and runs before curation lands.
// Replace them entirely.
//
// HARD REQUIREMENT: at least one Cape Town event must use
//   schedule: { kind: 'offset', minutes: 15–30 }
// That is the "happening right now" card the closing beat depends on. It is marked
// below with HAPPENING-NOW. Do not delete it without replacing it.

import type { Place } from './types'

export const PLACES: Place[] = [
  // ---------------------------------------------------------------- CAPE TOWN
  {
    id: 'ct-golden-hour-6k',
    city: 'cape-town',
    area: 'Sea Point',
    kind: 'event',
    title: 'Golden hour 6k, Sea Point',
    blurb:
      'A slow 6km from the pavilion to the lighthouse and back, finishing in time for the last of the light. Someone always ends up buying coffee afterwards.',
    lat: -33.9128,
    lng: 18.3894,
    schedule: { kind: 'clock', dayOffset: 0, hour: 18, minute: 30 },
    durationMin: 60,
    price: 'Free',
    tags: ['running', 'outdoors', 'social'],
    image: '/images/golden-hour-6k.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    // HAPPENING-NOW — the closing beat. Keep one of these at all times.
    id: 'ct-woodstock-open-studio',
    city: 'cape-town',
    area: 'Woodstock',
    kind: 'event',
    title: 'Open studio, Woodstock',
    blurb:
      'Three painters open their studio doors for the evening. Walk in, look around, leave when you like.',
    lat: -33.9275,
    lng: 18.4455,
    schedule: { kind: 'offset', minutes: 22 },
    durationMin: 120,
    price: 'Free',
    tags: ['art', 'social'],
    image: '/images/woodstock-open-studio.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    id: 'ct-kalk-bay-swim',
    city: 'cape-town',
    area: 'Kalk Bay',
    kind: 'event',
    title: 'Cold water swim, Kalk Bay',
    blurb: 'In at 17:45, out by 18:00, coffee by 18:15. Colder than you think.',
    lat: -34.1281,
    lng: 18.4487,
    schedule: { kind: 'clock', dayOffset: 1, hour: 17, minute: 45 },
    durationMin: 45,
    price: 'R60',
    tags: ['swimming', 'outdoors', 'wellness'],
    image: '/images/kalk-bay-swim.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    id: 'ct-obz-open-mic',
    city: 'cape-town',
    area: 'Observatory',
    kind: 'event',
    title: 'Open mic, Obz Café',
    blurb: 'Four acts, one room, no cover. Get there early if you want to sit down.',
    lat: -33.9384,
    lng: 18.4676,
    schedule: { kind: 'clock', dayOffset: 0, hour: 21, minute: 0 },
    durationMin: 180,
    price: 'Free',
    tags: ['live-music', 'nightlife', 'social'],
    image: '/images/obz-open-mic.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    id: 'ct-oranjezicht-market',
    city: 'cape-town',
    area: 'Oranjezicht',
    kind: 'event',
    title: 'Slow market morning',
    blurb: 'Produce, bread and too much coffee, with the mountain right there.',
    lat: -33.9081,
    lng: 18.4194,
    schedule: { kind: 'clock', dayOffset: 1, hour: 9, minute: 0 },
    durationMin: 180,
    price: 'Free',
    tags: ['markets', 'food', 'coffee'],
    image: '/images/oranjezicht-market.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    id: 'ct-contour-path',
    city: 'cape-town',
    area: 'Table Mountain',
    kind: 'event',
    title: 'Contour path hike',
    blurb: 'Two hours along the contour, back before it gets hot. Bring water.',
    lat: -33.9628,
    lng: 18.4098,
    schedule: { kind: 'clock', dayOffset: 1, hour: 7, minute: 0 },
    durationMin: 150,
    price: 'Free',
    tags: ['hiking', 'outdoors'],
    image: '/images/contour-path.jpg',
    imageCredit: 'EXAMPLE — replace',
  },

  // -------------------------------------------------------------------- TOKYO
  {
    id: 'tk-nakameguro-coffee',
    city: 'tokyo',
    area: 'Nakameguro',
    kind: 'place',
    title: 'Canal-side coffee, Nakameguro',
    blurb: 'A counter, eight seats, and the river outside. Go before ten.',
    lat: 35.6447,
    lng: 139.6993,
    schedule: { kind: 'clock', dayOffset: 0, hour: 8, minute: 0 },
    durationMin: 60,
    price: '¥600',
    tags: ['coffee', 'food'],
    image: '/images/nakameguro-coffee.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
  {
    id: 'tk-shimokita-records',
    city: 'tokyo',
    area: 'Shimokitazawa',
    kind: 'place',
    title: 'Record bars, Shimokitazawa',
    blurb: 'Six tiny bars on one street, each with a wall of vinyl and room for nine people.',
    lat: 35.6613,
    lng: 139.6679,
    schedule: { kind: 'clock', dayOffset: 0, hour: 20, minute: 0 },
    durationMin: 180,
    price: '¥1,500',
    tags: ['live-music', 'nightlife', 'social'],
    image: '/images/shimokita-records.jpg',
    imageCredit: 'EXAMPLE — replace',
  },
]

export const placeById = (id: string): Place | undefined =>
  PLACES.find((p) => p.id === id)
