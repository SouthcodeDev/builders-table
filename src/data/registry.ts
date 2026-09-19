// registry.ts — place lookup that also sees events created live in the app.
//
// src/data/places.ts is GENERATED and must stay that way, so the runtime registry
// lives here instead. seed.ts re-exports this placeById, which means every existing
// `placeById(id)` call site resolves business-created events with no change.
//
// ponytail: module-level mutable state, populated once by the provider on hydrate.
// It is correct because there is exactly one user per device and the created set is
// the same for every surface. If a lookup ever has to differ per viewer, move this
// into the provider and thread it through.

import { PLACES } from './places'
import type { Place } from './types'

let extras: Place[] = []

export const registerPlaces = (list: Place[]) => {
  extras = list
}

export const extraPlaces = (): Place[] => extras

export const placeById = (id: string): Place | undefined =>
  PLACES.find((p) => p.id === id) ?? extras.find((p) => p.id === id)
