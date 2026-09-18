# Image credits

Unsplash's licence asks for attribution. This file is the record. Every photographer
name below was read off that photo's own Unsplash page, not guessed.

Place and event photography carries its credit in the data instead: the `image_credit`
column of `data/places.csv`, surfaced as `Place.imageCredit`. Every row there is still
`TODO` — see `docs/CURATION.md` §3.

## Interest chips — `public/images/interests/`

Twelve tiles, one per `INTEREST_TAGS` entry in `src/data/vocab.ts`. All 480×360.
Sourced 2026-09-18. These replaced flat gradient placeholders.

| File | Chip label | Photographer | Unsplash |
|---|---|---|---|
| `running.jpg` | Running | SwapnIl Dwivedi | https://unsplash.com/photos/Xcmfp0gBukI |
| `hiking.jpg` | Hiking | Holly Mandarich | https://unsplash.com/photos/7MrXw_o7Eo4 |
| `outdoors.jpg` | Outdoors | Lachlan Starr | https://unsplash.com/photos/JVqTGH_1Ckk |
| `fitness.jpg` | Getting active | Geert Pieters | https://unsplash.com/photos/3RnkZpDqsEI |
| `food.jpg` | Eating out | tommao wang | https://unsplash.com/photos/MAFMkfevd7w |
| `coffee.jpg` | Coffee | Joshua Rodriguez | https://unsplash.com/photos/f7zm5TDOi4g |
| `art.jpg` | Art & culture | Jessica Pamp | https://unsplash.com/photos/JNTSoyb_bbw |
| `making.jpg` | Making things | Vitaly Gariev | https://unsplash.com/photos/a0xqXaRXFrA |
| `live-shows.jpg` | Live shows | Vishnu R Nair | https://unsplash.com/photos/m1WZS5ye404 |
| `social.jpg` | Meeting people | Helena Lopes | https://unsplash.com/photos/e3OUQGT9bWU |
| `wellness.jpg` | Slowing down | kike vega | https://unsplash.com/photos/F2qh3yjz6Jk |
| `giving-back.jpg` | Giving back | Vitaly Gariev | https://unsplash.com/photos/FJRYUL_YHXg |

If a chip is ever added or renamed, its tile must be added here in the same pass. The
filename has to match the tag exactly — `src/components/interest-tile.tsx` builds the
path from the tag with no fallback, so a missing file is a blank tile.

## Hero photography — `public/images/`

| File | Screen | Size | Photographer | Unsplash |
|---|---|---|---|---|
| `hero-splash.jpg` | splash, bottom arch | 900×620 | Valentin | https://unsplash.com/photos/e3l2i5P4k0M |
| `hero-signin.jpg` | sign in, top panel | 900×860 | Polina Kuzovkova | https://unsplash.com/photos/40N4F93__Sk |

`hero-splash.jpg` has a small neon sign in the top-left. The 220px top radius on the
splash arch cuts that corner away, but it is worth an eyeball on device.

## Not credited, because they are placeholders

The eight event photos — `golden-hour-6k`, `contour-path`, `kalk-bay-swim`,
`obz-open-mic`, `oranjezicht-market`, `woodstock-open-studio`, `nakameguro-coffee`,
`shimokita-records` — are still flat gradients. They belong to the invented rows in
`src/data/places.ts`, which get deleted the moment `node scripts/build-places.mjs` can
run. Sourcing photography for them would be thrown away. Real photos are needed for
the trimmed real set instead, with filenames matching the `image` column of
`data/places.csv` — `docs/CURATION.md` §3.
