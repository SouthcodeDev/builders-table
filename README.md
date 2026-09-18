# bounce

A 24-hour hackathon demo for Builders Table 2026. It gets driven on stage from a
pre-installed PWA on one iPhone, twice, in under five minutes.

The product idea is that the app's job is to end the session. You get a finite deck of
six cards, you say yes to something, and the last screen hands you to Apple Maps and
gets out of the way. There is no infinite feed and there are no streaks — that is the
thesis, not an oversight.

Read `AGENTS.md` before changing anything. Part 1 is the rules, Part 2 is what is
actually in here.

## Run it

```bash
npm ci
cp .env.local.example .env.local   # then fill in the values — ask the team
npm run dev                        # http://localhost:3000
```

Everything degrades without credentials: no Mapbox token hides the map behind a panel,
no OpenRouter key makes `/api/persona` return a local tag-overlap ranking, no Supabase
makes invites stay on the device. The demo never blocks on the network.

Designed for 390 × 844, iOS Safari in standalone. Desktop is not a supported layout.

## The two doors

Sign-in is a facade. There is no auth.

- **"I'm a Builder's Table judge"** — a fresh account. Interests → one model call →
  persona card → feed.
- **"Continue with Google" / "Continue with Apple"** — Sam Mbeki, fully populated from
  seed: friends, plans, a passport, a pre-written persona.

Append `?as=ameer` to pin the second phone's identity for the cross-device invite.

## Checks

```bash
npm run typecheck
npm run build
npm run lint
```

Neither of the first two passing means a change is done. Anything touching layout,
gestures, the map or the maps handoff has to be seen on the demo iPhone at the deployed
URL, from the installed PWA. Desktop Chrome is not evidence.

## Rebuilding the places data

Curated content lives in the repo, not the database. The database holds one thing:
invites created live during the demo.

`data/places.csv` is the source of truth for places and events.
`src/data/places.ts` is generated from it:

```bash
node scripts/build-places.mjs
```

The script validates and refuses to write a broken file. It rejects an unknown tag, a
row with no interest tag, coordinates outside the city's bounding box (which catches a
swapped lat/lng), a missing happening-now row, and any onboarding chip with zero places
behind it.

**It will not run today.** All 54 rows have empty coordinates, so `src/data/places.ts`
is still a set of invented placeholder rows. Filling the coordinates in is a ten-minute
human job through Google My Maps — `docs/CURATION.md` §1 — followed by:

```bash
node scripts/merge-coords.mjs data/places.kml
```

## Layout of the repo

```
src/app/          routes; layout.tsx is the only server file
src/app/api/      the single route handler — /api/persona, the app's one model call
src/components/   presentational components, shared by both demo modes
src/data/         the seed layer; import from src/data/seed.ts, never the files under it
src/state/        one provider, one source of truth, persisted to localStorage
scripts/          build-places, merge-coords, audit
data/             places.csv
docs/             curation, build order, image credits
```
