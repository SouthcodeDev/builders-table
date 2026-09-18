#!/usr/bin/env node
// merge-coords.mjs — pull coordinates out of a My Maps KML export and write them
// back into data/places.csv.
//
//   node scripts/merge-coords.mjs data/places.kml
//
// Workflow:
//   1. mymaps.google.com → Create a new map → Import → data/places.csv
//   2. Choose `address` as the location column, `title` as the marker name
//   3. Look at the map. Drag any pin that landed wrong. (Vague ones — Silvermine,
//      Kloof Corner, Newlands Forest — will need this. That's the whole point of
//      doing it visually.)
//   4. Map menu (⋮) → Export to KML/KMZ → tick "Export as KML instead of KMZ"
//   5. Save it next to the CSV and run this script.
//
// Matches on `id` from the KML's ExtendedData first, then falls back to title.
// Never overwrites a coordinate you already filled in by hand.

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'

const KML = process.argv[2]
const CSV = 'data/places.csv'
if (!KML || !existsSync(KML)) {
  console.error('usage: node scripts/merge-coords.mjs <path-to.kml>')
  process.exit(1)
}

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .trim()

// ---- parse KML placemarks -------------------------------------------------
const kml = readFileSync(KML, 'utf8')
const byId = new Map(), byName = new Map()

for (const m of kml.matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)) {
  const block = m[1]
  const coord = block.match(/<coordinates>\s*([-\d.]+)\s*,\s*([-\d.]+)/)
  if (!coord) continue
  const lng = Number(coord[1]), lat = Number(coord[2]) // KML is lng,lat
  const name = decode((block.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || '')
  const idm = block.match(/<Data name="id">\s*<value>([\s\S]*?)<\/value>/)
  if (idm) byId.set(decode(idm[1]), { lat, lng })
  if (name) byName.set(name.toLowerCase(), { lat, lng })
}
console.log(`  read ${byId.size || byName.size} placemarks from ${KML}`)

// ---- parse CSV ------------------------------------------------------------
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
const esc = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

const rows = parseCSV(readFileSync(CSV, 'utf8'))
const cols = rows[0].map((h) => h.trim())
const iId = cols.indexOf('id'), iTitle = cols.indexOf('title')
const iLat = cols.indexOf('lat'), iLng = cols.indexOf('lng')

let filled = 0, kept = 0
const missing = []

for (const r of rows.slice(1)) {
  const id = (r[iId] || '').trim()
  if ((r[iLat] || '').trim() && (r[iLng] || '').trim()) { kept++; continue }
  const hit = byId.get(id) || byName.get((r[iTitle] || '').trim().toLowerCase())
  if (!hit) { missing.push(id); continue }
  r[iLat] = hit.lat.toFixed(6)
  r[iLng] = hit.lng.toFixed(6)
  filled++
}

copyFileSync(CSV, CSV + '.bak')
writeFileSync(CSV, rows.map((r) => r.map(esc).join(',')).join('\n') + '\n')

console.log(`✓ filled ${filled} · kept ${kept} already set · backup at ${CSV}.bak`)
if (missing.length) {
  console.warn(`⚠ no match for ${missing.length}: ${missing.join(', ')}`)
  console.warn('  Fill these by hand: Google Maps → right-click pin → click the lat,lng to copy.')
}
console.log('  Now run: node scripts/build-places.mjs')
