#!/usr/bin/env node
// build-places.mjs — data/places.csv  →  src/data/places.ts
//
//   node scripts/build-places.mjs
//
// Validates as it goes and REFUSES to write a broken file. Cheap insurance against a
// typo that only surfaces as a blank map at 23:00.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const INTEREST_TAGS = ['running','hiking','outdoors','fitness','food','coffee','art','making','live-shows','social','wellness','giving-back']
const DETAIL_TAGS = ['nature','pottery','climbing','halal','fashion','cooking','paddling','surfing','cycling','heritage','market','music','theatre','motorsport','beach','family']
const TAGS = [...INTEREST_TAGS, ...DETAIL_TAGS]
const CITIES = ['cape-town','tokyo']
const BOUNDS = {
  'cape-town': { lat: [-34.40, -33.40], lng: [18.20, 19.00] },
  tokyo: { lat: [35.40, 36.10], lng: [139.30, 140.00] },
}
const SRC = 'data/places.csv'
const OUT = 'src/data/places.ts'

if (!existsSync(SRC)) { console.error(`✗ ${SRC} not found`); process.exit(1) }

function parseCSV(text) {
  const rows = []; let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

const [header, ...body] = parseCSV(readFileSync(SRC, 'utf8'))
const cols = header.map((h) => h.trim())
const get = (r, n) => (r[cols.indexOf(n)] ?? '').trim()

const errors = [], warnings = [], seen = new Set()
let happeningNow = 0, missingCoords = 0

const places = body.map((r, i) => {
  const line = i + 2
  const id = get(r, 'id')
  const fail = (m) => errors.push(`line ${line} (${id || '?'}): ${m}`)
  const warn = (m) => warnings.push(`line ${line} (${id || '?'}): ${m}`)

  if (!id) fail('missing id')
  if (seen.has(id)) fail('duplicate id')
  seen.add(id)

  const city = get(r, 'city')
  if (!CITIES.includes(city)) fail(`bad city "${city}"`)

  const latS = get(r, 'lat'), lngS = get(r, 'lng')
  let lat = Number(latS), lng = Number(lngS)
  if (!latS || !lngS) { missingCoords++; fail('lat/lng not filled in — see CURATION.md') }
  else if (!Number.isFinite(lat) || !Number.isFinite(lng)) fail('lat/lng not numeric')
  else if (BOUNDS[city]) {
    const b = BOUNDS[city]
    if (lat < b.lat[0] || lat > b.lat[1] || lng < b.lng[0] || lng > b.lng[1])
      fail(`coords ${lat},${lng} are outside ${city} — did you swap lat and lng?`)
  }

  const tags = get(r, 'tags').split('|').map((t) => t.trim()).filter(Boolean)
  if (!tags.length) fail('no tags — it can never be recommended')
  tags.forEach((t) => { if (!TAGS.includes(t)) fail(`tag "${t}" is not in the vocabulary`) })
  if (!tags.some((t) => INTEREST_TAGS.includes(t)))
    fail('no INTEREST tag — nothing on the onboarding chip grid can ever match this')

  const kind = get(r, 'schedule_kind')
  let schedule
  if (kind === 'offset') {
    const m = Number(get(r, 'offset_minutes'))
    if (!Number.isFinite(m)) fail('offset_minutes missing')
    if (m >= 15 && m <= 30) happeningNow++
    schedule = { kind: 'offset', minutes: m }
  } else if (kind === 'clock') {
    schedule = {
      kind: 'clock',
      dayOffset: Number(get(r, 'day_offset') || 0),
      hour: Number(get(r, 'hour')),
      minute: Number(get(r, 'minute') || 0),
    }
    if (!Number.isFinite(schedule.hour)) fail('hour missing')
  } else fail(`schedule_kind must be offset or clock, got "${kind}"`)

  const image = get(r, 'image')
  if (!image.startsWith('/images/')) fail('image must be a local /images/… path, never a remote URL')
  const credit = get(r, 'image_credit')
  if (!credit || credit === 'TODO') warn('image_credit still TODO (Unsplash licence condition)')
  if (!get(r, 'address')) warn('no address')

  const mLat = get(r, 'maps_lat'), mLng = get(r, 'maps_lng')
  return {
    id, city, area: get(r, 'area'), kind: get(r, 'kind') || 'event',
    title: get(r, 'title'), blurb: get(r, 'blurb'), address: get(r, 'address'),
    lat, lng, schedule,
    durationMin: Number(get(r, 'duration_min') || 60),
    price: get(r, 'price') || null, tags, image, imageCredit: credit,
    ...(mLat ? { mapsLat: Number(mLat) } : {}),
    ...(mLng ? { mapsLng: Number(mLng) } : {}),
  }
})

if (!happeningNow) errors.push('NO HAPPENING-NOW EVENT: one row needs schedule_kind=offset with offset_minutes between 15 and 30. The closing beat depends on it.')

// Coverage: every interest chip must have something behind it, or a judge can pick an
// interest that matches nothing and the feed comes back thin.
INTEREST_TAGS.forEach((t) => {
  const n = places.filter((p) => p.tags.includes(t)).length
  if (n === 0) errors.push(`INTEREST TAG "${t}" has zero places — a judge picking it gets nothing`)
  else if (n < 2) warnings.push(`interest tag "${t}" has only ${n} place`)
})

if (warnings.length) console.warn('⚠ warnings:\n' + warnings.map((w) => '  · ' + w).join('\n'))

if (errors.length) {
  if (missingCoords) {
    console.error(`\n✗ ${missingCoords} row(s) have no coordinates. Nothing written.`)
    console.error('  Google Maps → right-click the pin → click the lat,lng to copy → paste into the CSV.\n')
  }
  console.error('✗ places.csv has problems — nothing written:\n' + errors.slice(0, 40).map((e) => '  · ' + e).join('\n'))
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`)
  process.exit(1)
}

const out = `// GENERATED by scripts/build-places.mjs — do not hand-edit.
// Source: data/places.csv · ${places.length} places · ${new Date().toISOString()}

import type { Place } from './types'

export const PLACES: Place[] = ${JSON.stringify(places, null, 2)}

export const placeById = (id: string): Place | undefined =>
  PLACES.find((p) => p.id === id)
`
writeFileSync(OUT, out)
console.log(`✓ ${places.length} places → ${OUT}`)
console.log(`  cape-town ${places.filter((p) => p.city === 'cape-town').length} · tokyo ${places.filter((p) => p.city === 'tokyo').length} · happening-now ${happeningNow}`)
