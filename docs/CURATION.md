# CURATION.md — filling in the gaps

`data/places.csv` has 54 Cape Town rows. Everything is filled except the three things
below. `node scripts/build-places.mjs` will refuse to write until the first one is done.

## 1. Coordinates — blocking, ~10 minutes

`lat` and `lng` are empty on every row. Do all 54 in one pass through Google My Maps
rather than right-clicking pins one at a time:

1. **mymaps.google.com** → Create a new map → **Import** → upload `data/places.csv`
2. Choose **`address`** as the column that positions the markers, **`title`** as the
   marker name
3. **Look at the map.** Drag any pin that landed wrong. The vague ones will need it —
   `ct-silvermine`, `ct-kloof-corner`, `ct-newlands-forest`, `ct-cecilia-forest` are
   park entries, not street addresses, so a geocoder will guess. Drop those pins on the
   actual trailhead parking, which is where you'd want "Let's go Places" to send someone
   anyway.
4. Map menu (⋮) → **Export to KML/KMZ** → tick *Export as KML instead of KMZ*
5. `node scripts/merge-coords.mjs data/places.kml`

The merge script matches on `id` (from the KML's ExtendedData), falls back to title,
never overwrites a coordinate you set by hand, and backs up the CSV before writing. It
lists anything it couldn't match so you can fill those few manually.

Then `node scripts/build-places.mjs`. It rejects coordinates outside Cape Town's bounding
box, which catches swapped lat/lng — the classic error. It cannot catch "right city,
wrong spot", which is why step 3 matters.


## 2. Blurbs — written, need verifying

Every blurb is a **draft**. They're written from the category and the address, not from
first-hand knowledge, so some will be slightly wrong about a specific place. Read them
once. Anything you're not sure about, rewrite in your own words — you know these places
and it will show.

Same for the scheduled times: they're plausible, not researched. The ones that matter
are the ones you'll actually show on stage. Fix those and let the rest be.

## 3. Images and credits — required before deploy

Download from Unsplash, save to `/public/images/` using the filename already in the
`image` column, and put the photographer's name in `image_credit`. The script warns on
every `TODO`.

54 images is too many to source. See "trim the list" below.

---

## Trim the list

54 is more than the demo needs and more than you can find images for. Target **20–24**
Cape Town entries. What to keep:

- **Everything in or near Woodstock.** Clay Hands and Greenpop are both walking distance
  from Parkview. Real distances on screen are your cheapest credibility.
- **At least two per interest chip.** The script errors if a chip has zero places and
  warns if it has one — a judge must never pick an interest and get a thin feed.
- **A good ratio of dated events to always-open places.** The product answers "what's on
  tonight", so a list dominated by venues weakens the pitch.
- **The six that will be in the deck**, chosen deliberately rather than by whatever ranks.

`ct-clay-hands` is the happening-now row (`offset`, 22 minutes). Do not delete it without
replacing it — the closing beat depends on one existing.

## Still missing

- **Tokyo.** Nothing curated yet. Six to eight is plenty, spread across four or five
  interest tags so the "one more thing" moment shows real range.
- **Prices.** Every `price` is blank, which renders as no price. Fill in the handful
  you'll actually show; leave the rest.
