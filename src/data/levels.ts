// levels.ts — the collection, and what moves it.
//
// READ AGENTS.md §1.2 BEFORE CHANGING ANYTHING HERE.
//
// §1.2 bans streaks, points and badges awarded for APP USAGE. Levels here are not
// that, and must never become that. Every single thing that moves a level is a place
// you physically turned up to:
//
//   · one stamp per real-world attendance
//   · bounces count because leaving your own tags is the hard part
//   · going with people counts because the product exists to get you out with people
//
// What is deliberately absent, and stays absent:
//
//   · no streak — nothing decays, a gap costs you nothing, there is no "don't break
//     the chain" pressure. The green band on the share card names what a stamp WAS,
//     it does not count consecutive days.
//   · no score shown anywhere — levels come from counts of real attendance, not from
//     a points total the UI can inflate.
//   · nothing awarded for opening the app, scrolling, or coming back.

import type { PassportStamp } from './types'

export type LevelDef = {
  n: number
  name: string
  /** Stamps needed to reach it. */
  at: number
}

/**
 * Thresholds are on STAMPS — places actually attended. Someone who goes out twice a
 * month gets there eventually; someone who opens the app daily and goes nowhere does
 * not move at all. That asymmetry is the point.
 */
export const LEVELS: LevelDef[] = [
  { n: 1, name: 'Just landed', at: 0 },
  { n: 2, name: 'Getting out', at: 5 },
  { n: 3, name: 'Regular', at: 12 },
  { n: 4, name: 'Wanderer', at: 25 },
  { n: 5, name: 'Knows the city', at: 45 },
]

export type LevelState = {
  level: LevelDef
  next: LevelDef | null
  /** Stamps collected into the current level. */
  into: number
  /** Stamps between this level and the next. null at the top. */
  span: number | null
  /** 0–1 for the progress track. 1 at the top level. */
  progress: number
}

export function levelFor(stamps: number): LevelState {
  let level = LEVELS[0]
  for (const l of LEVELS) if (stamps >= l.at) level = l
  const next = LEVELS.find((l) => l.at > level.at) ?? null
  if (!next) {
    return { level, next: null, into: stamps - level.at, span: null, progress: 1 }
  }
  const span = next.at - level.at
  const into = stamps - level.at
  return { level, next, into, span, progress: Math.min(1, into / span) }
}

/**
 * The two things worth counting beside raw attendance. Both are real-world facts
 * read off the stamps — neither is a streak and neither resets.
 */
export function collection(stamps: PassportStamp[]) {
  return {
    total: stamps.length,
    /** Times you took something outside the tags you picked. */
    bounced: stamps.filter((s) => s.kind === 'bounce').length,
    /** Times you went with at least one other person. */
    withPeople: stamps.filter((s) => s.withFriends > 0).length,
    /** Distinct areas the collection covers. */
    areas: new Set(stamps.flatMap((s) => s.areas)).size,
  }
}
