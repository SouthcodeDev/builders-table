#!/usr/bin/env node
/**
 * provisional-coords.mjs — fill EMPTY lat/lng in data/places.csv with the approximate
 * centre of each suburb, so Mapbox work can start before the real coordinate pass.
 *
 *   node scripts/provisional-coords.mjs
 *
 * ⚠️ THESE ARE NOT REAL COORDINATES. They are suburb centres, accurate to roughly a
 * kilometre, written from general knowledge of Cape Town. Every place in the same
 * suburb gets the SAME point, so pins will visibly stack. That is deliberate — it makes
 * the placeholder state obvious rather than plausible.
 *
 * They exist so the map, the pin sheet, distance sorting and the radius filter can be
 * built and tested today. They MUST be replaced before the demo by the real pass in
 * docs/CURATION.md §1 (My Maps → KML → merge-coords.mjs), which overwrites these.
 *
 * Marks each filled row `coords_source=provisional`. merge-coords.mjs overwrites any
 * row whose source is provisional; rows marked `verified` are left alone.
 */

import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

const CSV = 'data/places.csv'

// Approximate suburb centres. Replace, never trust for distance claims on stage.
const AREA_CENTRES = {
  'Athlone':           [-33.9640, 18.5100],
  'Belthorn Estate':   [-33.9920, 18.5150],
  'Bo-Kaap':           [-33.9200, 18.4130],
  'Century City':      [-33.8930, 18.5100],
  'City Bowl':         [-33.9250, 18.4180],
  'Claremont':         [-33.9830, 18.4650],
  'Epping':            [-33.9350, 18.5450],
  'Foreshore':         [-33.9190, 18.4310],
  'Gardens':           [-33.9310, 18.4110],
  'Green Point':       [-33.9060, 18.4100],
  'Hout Bay':          [-34.0380, 18.3540],
  'Kenilworth':        [-33.9950, 18.4770],
  'Killarney Gardens': [-33.8260, 18.5250],
  'Lansdowne':         [-33.9880, 18.5030],
  'Mouille Point':     [-33.8990, 18.4090],
  'Muizenberg':        [-34.1030, 18.4700],
  'Newlands':          [-33.9770, 18.4530],
  'Observatory':       [-33.9390, 18.4690],
  'Paarden Eiland':    [-33.9060, 18.4750],
  'Parow':             [-33.9010, 18.5950],
  'Rondebosch':        [-33.9600, 18.4750],
  'Salt River':        [-33.9300, 18.4650],
  'Signal Hill':       [-33.9150, 18.4030],
  'Silvermine':        [-34.0900, 18.4100],
  'Table Mountain':    [-33.9620, 18.4090],
  'Table View':        [-33.8200, 18.4900],
  'V&A Waterfront':    [-33.9040, 18.4200],
  'Woodstock':         [-33.9270, 18.4470],
  'Wynberg':           [-34.0020, 18.4670],
  'Zonnebloem':        [-33.9320, 18.4290],
}

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
const esc = (v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v))

const rows = parseCSV(readFileSync(CSV, 'utf8'))
const cols = rows[0].map((h) => h.trim())

// Add coords_source if the CSV predates it.
let iSrc = cols.indexOf('coords_source')
if (iSrc === -1) {
  cols.push('coords_source')
  rows[0] = cols
  for (const r of rows.slice(1)) r.push('')
  iSrc = cols.length - 1
}
const iArea = cols.indexOf('area'), iLat = cols.indexOf('lat'), iLng = cols.indexOf('lng')

let filled = 0, kept = 0
const unknown = new Set()

for (const r of rows.slice(1)) {
  if ((r[iLat] ?? '').trim() && (r[iLng] ?? '').trim()) { kept++; continue }
  const area = (r[iArea] ?? '').trim()
  const c = AREA_CENTRES[area]
  if (!c) { unknown.add(area); continue }
  r[iLat] = c[0].toFixed(4)
  r[iLng] = c[1].toFixed(4)
  r[iSrc] = 'provisional'
  filled++
}

copyFileSync(CSV, CSV + '.bak')
writeFileSync(CSV, rows.map((r) => r.map(esc).join(',')).join('\n') + '\n')

console.log(`✓ ${filled} row(s) given PROVISIONAL suburb-centre coordinates`)
console.log(`  ${kept} row(s) already had coordinates and were left alone`)
if (unknown.size) console.warn(`⚠ no centre for area(s): ${[...unknown].join(', ')} — add them to AREA_CENTRES`)
console.log('')
console.log('  These are placeholders accurate to about a kilometre. Pins in the same')
console.log('  suburb sit on the same point. Replace before the demo:')
console.log('    docs/CURATION.md §1 → node scripts/merge-coords.mjs data/places.kml')
