# BUILD_ORDER.md — what gets built, when, and what gets cut first

Anchored to the published schedule. Times are the event's, not estimates.

The sequencing principle: **the demo path is built end to end at low fidelity before
anything is made good.** A rough version of every screen by Friday evening beats three
beautiful screens and four missing ones. You cannot pitch a gap.

---

## Stage 0 — 10:00–12:00 (Sprint 1) · Skeleton and the risky bits

Both people. This is SETUP.md Steps 0–5.

- Repo, Next.js, Tailwind v4, HeroUI v3 → **Gate 1**
- Fonts, manifest, viewport → **Gate 2**
- Deploy, install on the demo iPhone → **Gate 3**
- Maps deep-link spike → **Gate 4**
- Mapbox rendering with dummy pins → **Gate 5**

**By 12:00 you must have:** an installed PWA on the phone, with a map, and a button that
opens Apple Maps. No product yet. If Gate 3 or Gate 4 hasn't passed by 12:00, escalate —
the demo's shape has to change.

---

## Stage 1 — 12:30–15:00 (Sprint 2) · Data and the judge path

Split here. One person on seed and provider, one on screens.

**Person A — data**
- Seed module + types → **Gate 6**
- Curated Cape Town and Tokyo entries loaded in
- Images downloaded, committed, credited
- Mode provider → **Gate 7**
- `/api/persona` route + fallback → **Gate 9**

**Person B — Demo 1 screens, unstyled but real**
- Splash
- Sign in, with three doors: judge / Google / email (email inert)
- Interests (chip multi-select, 3+ gate)
- Persona loading state
- Persona card
- Discover feed
- Event detail
- "I'm going" → Plans

**By 15:00:** Demo 1 runs end to end on the phone. Ugly is fine. Broken is not.

---

## Stage 2 — 15:15–16:45 (Sprint 3) · Demo 2 skeleton

- Google door → active user loads from seed
- Discover in active mode (friend avatars, friend plans visible)
- Map view + pin sheet
- Plans screen, populated
- Passport screen (static from seed, non-interactive)
- Tokyo city switch

### ⛔ 16:45 — Day-1 checkpoint. This is a real gate.

**Submit whatever is running.** Both demo paths must be walkable on the phone, however
rough. If Demo 2 isn't walkable, cut the passport and the Tokyo switch to make it so —
they're additive, not structural.

---

## Stage 3 — 18:00 onward (evening sprint) · Craft and the two bespoke moments

This is where the panel's design bias gets served. Order matters: the two interactions
below are the things nobody else will have.

1. **Swipe deck** (3–4h, the largest remaining item)
   - Use a drag library. Do not hand-roll pointer events.
   - **Left/right only.** Drop swipe-up-to-save — vertical drag fights iOS overscroll in
     standalone mode and costs an hour in `touch-action` / `overscroll-behavior` for an
     interaction nobody will perform on stage. Save is a button.
   - Reads the stored ranking. **No model call.**
   - Six cards, hard stop, explicit end state.

2. **Plan & invite sheet + cross-device send** → **Gate 8**
   - Including the local fallback trigger.

3. **Visual pass**, in demo order: Splash → Interests → Persona → Discover → Event detail
   → Deck → Plan sheet → Plans → Passport → Tokyo.

4. **Persistence audit.** Force-quit the app at six different points and reopen. Anything
   that loses state is a bug, not a nicety.

### Freeze scope when you stop on Friday night. Nothing new is added on Saturday.

---

## Stage 4 — Sat 09:30–11:30 (Sprint 4) · Bugs, polish, rehearsal

Not a build session. Split it:

- **09:30–10:15** — bug freeze. Fix only what breaks the path. Log everything else, fix
  nothing else.
- **10:15–10:45** — organiser screen (see below), if and only if the path is stable.
- **10:45–11:15** — final deploy, reinstall the PWA fresh on the demo phone, walk both
  demos twice on the production build.
- **11:15–11:45** — **rehearse the pitch out loud, three times, with the phone in hand
  and a stopwatch.** This is the highest-value half hour of Saturday.
- **11:45–11:59** — submit.

---

## The organiser screen

Confirmed scope: **one screen, static, no AI.**

A business view showing an already-created event (from seed) with an interest count and
a "create event" form that is visually complete and does nothing. It exists so the pitch
can say "and this is how the supply side works" over two seconds of screen, then move on.

Budget: 30 minutes. It is the first thing cut if Saturday morning is tight.

---

## Cut order

When you're behind — and you will be — cut from the bottom up. Do not improvise this at
23:00; the order is decided now, in daylight.

| Cut # | Item | Why it survives this long |
|---|---|---|
| 1 | Organiser screen | Two seconds of pitch, zero demo dependency |
| 2 | Passport | Nice depth beat, but Demo 2 works without it |
| 3 | Map view (keep feed only) | Feed carries discovery; map is the prettier half |
| 4 | Tokyo | A strong closer, but the maps handoff is the real closer |
| 5 | Cross-device invite | Falls back to the local animation; audience can't tell |
| 6 | Swipe deck | Painful — it's the most distinctive thing you have |

**Never cut:** the judge onboarding path, the persona card, Discover feed, Event detail,
Plans, and the "Let's go Places" handoff. Those six are the demo.

---

## Parallelisation rule

Two people, one repo, one phone. To avoid stepping on each other:

- Person A owns `lib/`, `data/`, `app/api/`, the provider.
- Person B owns `app/(screens)/`, `components/`.
- Commit and push at the top of every hour, minimum. Merge conflicts at 01:00 are how
  hackathon builds die.
- Only one person touches the demo phone's installed PWA at a time, and it is always the
  production URL — never a local dev server.
