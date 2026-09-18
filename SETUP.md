# SETUP.md — skeleton, in order, with gates

Fresh repo. Nothing carried in. Every step has a pass condition. **Do not start the next
step until the current one passes.** If a gate fails, fix it before proceeding — a failed
gate discovered at 22:00 costs three hours; discovered at 10:30 it costs twenty minutes.

Steps 0–4 are the riskiest things in the build and they are deliberately first. They are
also the cheapest to abandon. If the maps handoff (Gate 4) cannot be made to work, you
need to know before you have built a product around it.

---

## Step 0 — Accounts and keys, before any code

- [ ] GitHub repo created, both members have push access
- [ ] Vercel project connected to the repo
- [ ] Mapbox account, public access token in hand
- [ ] OpenRouter account with **credit on it** (not a trial balance you haven't checked)
- [ ] Supabase project created, anon key and URL in hand
- [ ] Font files: PP Watch and FT Polar, licensed or trial webfont kit, converted to `.woff2`

**Gate 0:** every credential above is pasted into a shared note both of you can read.
No step later in this document should require anyone to go hunting for a key.

> **Font licensing is a real blocker, not admin.** These are commercial faces and this
> deploys to a public URL. If a licence can't be sorted in ten minutes, pick a free
> substitute now and tell the designer, rather than discovering a fallback-font demo on
> Saturday morning.

---

## Step 1 — Next.js + Tailwind v4 + HeroUI v3

```
npx create-next-app@latest  (App Router, TypeScript, Tailwind, no src/ preference is fine)
npm i @heroui/react
```

HeroUI v3 is a breaking change from v2. Per the locked decision:

- **No `HeroUIProvider`**
- **No Tailwind plugin entry**
- **Two CSS imports only**

**Verify this against the current v3 docs before writing a single component.** If the
docs contradict the above, the docs win — update AGENTS.md Part 2 and tell the humans.
Do not apply v2 patterns from memory.

Add `"use client"` to every file except `app/layout.tsx`.

**Gate 1:** `npm run dev` serves a page with one HeroUI button rendering with HeroUI's
own styles, and `npm run build` passes.

---

## Step 2 — Fonts, viewport, PWA manifest

- `.woff2` files in `/public/fonts`, `@font-face` declarations with `font-display: swap`
- `app/layout.tsx`: viewport meta with `viewport-fit=cover`, `apple-mobile-web-app-capable`,
  `apple-mobile-web-app-status-bar-style`
- `manifest.json` with `display: "standalone"`, name, and 192/512 icons
- `theme-color` meta matching the app background
- Safe-area padding helpers (`env(safe-area-inset-bottom)`) available as utilities

**Gate 2:** page loads with the real typefaces, not fallbacks. Check on the phone, not
in Chrome DevTools.

---

## Step 3 — Deploy and install. Do this in the first hour.

Push. Let Vercel build. Open the production URL in **Safari on the demo iPhone**.
Share → Add to Home Screen. Open from the icon.

**Gate 3:** the app opens from the home screen with **no browser chrome** — no address
bar, no Safari toolbar. If any chrome is visible, the manifest is wrong. Fix it now.

> Everything after this point gets tested by pushing and reopening the installed app.
> The installed PWA is the only environment that counts.

---

## Step 4 — The maps handoff. Test it before you build anything around it.

Throwaway page, one button, hard-coded coordinates:

```
iOS      : https://maps.apple.com/?daddr=<lat>,<lng>
Other    : https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>
```

Sniff the user agent. Do not use `geo:` — Android only.

**Gate 4:** tapping the button **from the installed PWA** (not Safari) opens Apple Maps
with directions to the destination. Then press back / return to the app and note what
happens — cold reload or resumed state. Write the answer into AGENTS.md Part 2.

If this does not work from standalone mode, stop and tell the humans. The entire closing
beat of the demo depends on it and there is a fallback worth discussing (a full-screen
"opening Maps…" interstitial, or making it the literal last action so a cold reload
doesn't matter).

---

## Step 5 — Mapbox

```
npm i mapbox-gl
```

Mapbox GL JS touches `window` at import time. It **must** be loaded via
`next/dynamic` with `ssr: false`, and its stylesheet imported in the client component.

- Hard-code Woodstock (`-33.9270, 18.4470`) as the fallback centre
- Request geolocation once, during onboarding, never on first paint
- Handle denied and timed-out permission by silently using the fallback

**Gate 5:** `npm run build` passes (this is where SSR errors surface), and the map renders
with pins on the installed PWA over cellular, not just wifi.

---

## Step 6 — Seed module

Single typed module, no database.

```ts
type City = 'cape-town' | 'tokyo'

type Place = {
  id: string
  city: City
  area: string          // 'Sea Point' | 'Shibuya' — powers area search, no geocoding
  title: string
  blurb: string
  lat: number
  lng: number
  tz: string            // IANA, e.g. 'Africa/Johannesburg'
  startOffsetMin: number   // minutes from DEMO_NOW. NEVER an ISO string.
  durationMin: number
  price: string | null
  tags: string[]
  image: string         // /images/<file>.jpg — local, committed
  mapsDestination: { lat: number; lng: number }
}
```

Plus: `friends`, `demo2Plans`, `demo2Persona`, `demo2Passport`, `copy`.

Rules:
- `DEMO_NOW` is a single exported constant. Everything computes from it.
- At least one Cape Town event must have `startOffsetMin` between 15 and 30 — this is the
  "happening right now" card the closing beat depends on.
- Several Cape Town places must be genuinely within a few km of Woodstock, because the
  distances on screen must survive a judge who knows the city.
- Images are **downloaded from Unsplash and committed to `/public/images`**. Do not
  hotlink. Keep a `CREDITS.md` with photographer attributions.

**Gate 6:** `npm run typecheck` passes, and a scratch page lists all seed events with
computed local start times that look correct for both cities.

---

## Step 7 — Mode provider

One root provider resolving `mode: 'judge' | 'active'` from the door tapped on sign-in,
persisted to `localStorage`.

It exposes a single shape regardless of mode:

```
{ mode, user, persona, events, friends, plans, invites, actions }
```

In `judge` mode: no friends, no passport, empty plans, persona from the API response.
In `active` mode: everything from seed.

**Gate 7:** flipping the stored mode value by hand and reloading changes the whole app,
with zero mode conditionals inside any component under `components/`.

---

## Step 8 — Supabase invites (only if the cross-device beat is in)

Dashboard, by hand. One table:

```
invites: id (uuid, default) · from_user (text) · to_user (text)
         · event_id (text) · note (text) · created_at (timestamptz, default now())
```

RLS **off**. Anon key in `NEXT_PUBLIC_*`. No other tables. Ever.

Two hard-coded user IDs in seed: `hishaam`, `ameer`. Ameer's phone loads
`<url>?as=ameer`, which writes his identity to `localStorage` on first load.

Receiving device polls every 2s while the Plans screen is mounted. New row → animate in,
badge, haptic via `navigator.vibrate` where available.

**Build the local fallback at the same time**, not afterwards: a hidden tap target
(e.g. five taps on the Plans header) that fires the identical animation from local state.
If venue wifi dies, the beat still lands.

**Gate 8:** invite sent from phone A appears on phone B within four seconds, over a
phone hotspot, with both devices on the production URL. Rehearsed twice.

---

## Step 9 — `/api/persona`

Route handler. No `"use client"`. The only server code in the app.

```
POST /api/persona
  body: { interests: string[], city: City, candidates: {id, title, tags, startOffsetMin, distanceKm, price}[] }
  →     { label: string, sentence: string, ranked: { eventId: string, reason: string }[] }
```

- Calls OpenRouter. Model name in `OPENROUTER_MODEL` env var, never hard-coded.
- System prompt must include: *return only JSON matching this schema; select only from
  the supplied event IDs; never invent an event, time, price or place; reason lines are
  one sentence, under 15 words.*
- Validate the response shape. On any failure — network, timeout, malformed JSON, an ID
  not in the candidate set — fall back to local tag-overlap ranking and a generic persona
  sentence. **The onboarding flow must never show an error state.**
- Timeout at 6 seconds.

**Gate 9:** unplug the network mid-onboarding on the device. The persona card still
appears, with sensible content, within a couple of seconds.

---

## Step 10 — Environment variables

Set in Vercel **and** `.env.local`. Missing production vars is the classic Friday-evening
outage.

```
NEXT_PUBLIC_MAPBOX_TOKEN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

**Gate 10:** a fresh production deploy, opened from the home-screen icon, completes
Demo 1 end to end. Then fill in AGENTS.md Part 2.
