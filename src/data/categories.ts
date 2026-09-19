// categories.ts — what a place IS, for the map marker icon.
//
// There is no `category` column in the CSV and there must not be one. A second
// vocabulary alongside tags is a second thing to keep in sync, and they would drift
// by Saturday. The category is DERIVED from the tags a place already carries.
//
// ORDER IS THE WHOLE DESIGN. The first entry whose tag the place carries wins, so
// the list runs most-specific first: a wheel-throwing class is tagged
// `making|pottery` and must read as pottery, not as generic making. Reordering this
// list silently changes icons across the map — check the table in the test below it
// before you touch it.

import type { Tag } from './vocab'

export const CATEGORY_KEYS = [
  'giving-back', 'pottery', 'cooking', 'motorsport', 'cycling', 'climbing',
  'water', 'fashion', 'stage', 'music', 'market', 'running', 'hiking', 'coffee',
  'food', 'art', 'wellness', 'heritage', 'fitness', 'beach', 'nature',
  'outdoors', 'social', 'family', 'place',
] as const

export type Category = (typeof CATEGORY_KEYS)[number]

/** Tag → category, most specific first. First match wins. */
const PRECEDENCE: [Tag, Category][] = [
  ['giving-back', 'giving-back'],
  ['pottery', 'pottery'],
  ['cooking', 'cooking'],
  ['motorsport', 'motorsport'],
  ['cycling', 'cycling'],
  ['climbing', 'climbing'],
  ['surfing', 'water'],
  ['paddling', 'water'],
  ['fashion', 'fashion'],
  ['theatre', 'stage'],
  ['music', 'music'],
  ['market', 'market'],
  ['running', 'running'],
  ['hiking', 'hiking'],
  ['coffee', 'coffee'],
  ['food', 'food'],
  ['making', 'art'],
  ['art', 'art'],
  ['wellness', 'wellness'],
  ['live-shows', 'stage'],
  ['heritage', 'heritage'],
  ['fashion', 'fashion'],
  ['beach', 'beach'],
  ['nature', 'nature'],
  ['outdoors', 'outdoors'],
  ['social', 'social'],
  ['family', 'family'],
]

/** Never returns null — an untagged place still needs a pin. */
export function categoryFor(tags: readonly Tag[]): Category {
  for (const [tag, category] of PRECEDENCE) {
    if (tags.includes(tag)) return category
  }
  return 'place'
}
