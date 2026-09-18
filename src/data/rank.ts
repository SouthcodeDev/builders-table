import type { Place, PersonaResult } from '@/data/types'
import type { Tag } from '@/data/vocab'
import { minutesUntil } from './schedule'

/**
 * Deterministic local ranking. Two jobs:
 *   1. The fallback when /api/persona fails — the demo must never show an error.
 *   2. Ordering for anything that isn't the judge's personalised feed.
 *
 * Tag overlap dominates; soonness breaks ties.
 */
export function rankLocally(places: Place[], interests: Tag[]): Place[] {
  return [...places]
    .map((p) => {
      const overlap = p.tags.filter((t) => interests.includes(t)).length
      const mins = minutesUntil(p)
      const soonness = mins < 0 ? -1000 : Math.max(0, 600 - mins) / 600
      return { p, score: overlap * 10 + soonness }
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
}

/** Generic reason line for fallback mode. Never invents a fact. */
export function localReason(place: Place, interests: Tag[]): string {
  const hit = place.tags.find((t) => interests.includes(t))
  return hit ? `You said you're into ${hit.replace('-', ' ')}.` : 'Close by, and on tonight.'
}

export function fallbackPersona(places: Place[], interests: Tag[]): PersonaResult {
  const ranked = rankLocally(places, interests)
  return {
    label: 'Curious',
    sentence: "Let's start with what's on tonight and see what sticks.",
    tags: interests,
    ranked: ranked.map((p) => ({ eventId: p.id, reason: localReason(p, interests) })),
    fallback: true,
  }
}
