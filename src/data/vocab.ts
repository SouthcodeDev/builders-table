// vocab.ts — the shared tag vocabulary.
//
// THIS IS THE MOST IMPORTANT FILE IN THE DATA LAYER.
//
// Onboarding interest chips and event tags MUST come from this one list. If a judge
// picks "Coffee" and nothing is tagged 'coffee', the fallback ranking returns nothing
// and the model has nothing to match on. Every tag on every place must be in TAGS —
// the typechecker enforces it.

export const TAGS = [
  'running',
  'hiking',
  'swimming',
  'live-music',
  'food',
  'coffee',
  'markets',
  'art',
  'nightlife',
  'outdoors',
  'wellness',
  'social',
] as const

export type Tag = (typeof TAGS)[number]

// Onboarding chips, in render order.
// Keep to 10–12 so the grid fits 390px with no scroll and can be tapped in ~15 seconds.
export const INTEREST_CHIPS: { tag: Tag; label: string }[] = [
  { tag: 'running', label: 'Running' },
  { tag: 'hiking', label: 'Hiking' },
  { tag: 'swimming', label: 'Swimming' },
  { tag: 'live-music', label: 'Live music' },
  { tag: 'food', label: 'Food' },
  { tag: 'coffee', label: 'Coffee' },
  { tag: 'markets', label: 'Markets' },
  { tag: 'art', label: 'Art' },
  { tag: 'nightlife', label: 'Nightlife' },
  { tag: 'outdoors', label: 'Outdoors' },
  { tag: 'wellness', label: 'Wellness' },
  { tag: 'social', label: 'Meeting people' },
]

export const MIN_INTERESTS = 3
