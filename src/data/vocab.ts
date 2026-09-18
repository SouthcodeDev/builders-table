// vocab.ts — the shared tag vocabulary.
//
// THIS IS THE MOST IMPORTANT FILE IN THE DATA LAYER.
//
// Two layers:
//
//   INTEREST_TAGS  — the 12 onboarding chips. Ranking matches ONLY on these.
//                    Every place must carry at least one. The build script enforces it.
//
//   DETAIL_TAGS    — descriptive only. Never a chip, never used for matching.
//                    They exist so reason lines and cards can say something specific
//                    ("pottery", "halal", "surfing") without bloating the chip grid.
//
// If a curated place doesn't fit any interest tag, either retag it or promote a detail
// tag to an interest tag — and add the matching chip. Never let the two drift.

export const INTEREST_TAGS = [
  'running',
  'hiking',
  'outdoors',
  'fitness',
  'food',
  'coffee',
  'art',
  'making',
  'live-shows',
  'social',
  'wellness',
  'giving-back',
] as const

export const DETAIL_TAGS = [
  'nature', 'pottery', 'climbing', 'halal', 'fashion', 'cooking', 'paddling',
  'surfing', 'cycling', 'heritage', 'market', 'music', 'theatre', 'motorsport',
  'beach', 'family',
] as const

export const TAGS = [...INTEREST_TAGS, ...DETAIL_TAGS] as const

export type InterestTag = (typeof INTEREST_TAGS)[number]
export type Tag = (typeof TAGS)[number]

export const isInterestTag = (t: Tag): t is InterestTag =>
  (INTEREST_TAGS as readonly string[]).includes(t)

// Onboarding chips, in render order. 12 short labels — must wrap into a grid that
// fits 390px with NO scrolling, and be tappable in about 15 seconds.
export const INTEREST_CHIPS: { tag: InterestTag; label: string }[] = [
  { tag: 'food', label: 'Eating out' },
  { tag: 'coffee', label: 'Coffee' },
  { tag: 'hiking', label: 'Hiking' },
  { tag: 'running', label: 'Running' },
  { tag: 'outdoors', label: 'Outdoors' },
  { tag: 'fitness', label: 'Getting active' },
  { tag: 'art', label: 'Art & culture' },
  { tag: 'making', label: 'Making things' },
  { tag: 'live-shows', label: 'Live shows' },
  { tag: 'social', label: 'Meeting people' },
  { tag: 'wellness', label: 'Slowing down' },
  { tag: 'giving-back', label: 'Giving back' },
]

export const MIN_INTERESTS = 3
