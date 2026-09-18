# DESIGN_HANDOFF.md — Places, screen design brief

**For:** whoever is designing the screens (Claude Design or a human).
**Context:** a 24-hour hackathon build, judged partly on craft, demoed on one
pre-installed iPhone PWA. There is a v3 screen set already (`Places³ — Screens`); this
brief supersedes it where they differ and tells you what actually needs designing.

---

## 1. The product in one line

**Places helps people discover, commit to, and go to real things — then get off their phone.**

The interface has to *enact* that, not just say it. Judged by a panel heavy on product
design, brand, and creative direction. Craft is disproportionately rewarded here.

---

## 2. Non-negotiable design principles

- **Finite, not infinite.** No endless feeds. The deck is six cards and ends. Ending
  states are designed moments, not error states.
- **The app tells you to leave.** "Done — close the app", "No more cards tonight. That's
  on purpose.", "Or put the phone down — that's a perfectly good Tuesday too." This voice
  is the differentiator. Keep it.
- **No characters, no mascots, no illustrated creatures, no Headspace-style illustration.**
  Warmth comes from colour, typography, micro-copy and motion only.
- **Reference point:** Airbnb's structural discipline, with far more confident colour.
- **Photography does the emotional work.** Real places, real light. Free Unsplash imagery,
  downloaded and committed.

---

## 3. Fixed constraints

| | |
|---|---|
| Viewport | 390 × 844, designed for iOS Safari **standalone** (no browser chrome) |
| Safe areas | Respect top notch and bottom home indicator — `env(safe-area-inset-*)` |
| Components | HeroUI React v3 |
| Styling | Tailwind CSS v4 |
| Motion | CSS / Framer-lite only. No heavy animation libraries. |

---

## 4. Tokens (extracted from the v3 screen set — treat as the starting palette)

```
--ink            #0A0A0A     text, high contrast
--ink-60         rgba(10,10,10,0.5)
--ink-45         rgba(10,10,10,0.45)
--ink-16         rgba(10,10,10,0.16)   hairlines
--ink-08         rgba(10,10,10,0.08)   dividers

--surface        #FFFFFF
--canvas         #EFEDF5
--canvas-alt     #EAE8F2
--canvas-soft    #F5F4FA

--hero           #5100FF     primary action, the brand
--hero-deep      #2A0085     dark hero surfaces
--hero-soft      #B9A6FF
--accent         #3552E0
--muted          #6E6E76
```

**Radii:** `999px` is the dominant shape (pills, chips, buttons, avatars). Cards land
around `16–22px`. Device frame `42px`. Small tags `2–6px`.

**Type:** FT Polar (400 / 500) for heading and body; PP Watch (700 / 900) reserved for
the wordmark and rare statement moments. Scale in use: 10 · 11 · 13 · 14 · 15 · 16 · 17 ·
20 · 22 · 26 · 28. Heavy use of 11px uppercase with `0.1em` tracking for metadata labels
— keep that; it's carrying a lot of the app's character.

> **Licensing flag:** PP Watch and FT Polar are commercial. If licences aren't secured,
> a free substitute must be chosen before design proceeds, not after.

---

## 5. Two modes, same components

Every screen renders in one of two modes. **Design the components once; design the
states twice.**

| | **Judge mode** (Demo 1) | **Active mode** (Demo 2) |
|---|---|---|
| Entered via | "I'm a hackathon judge" door | "Continue with Google" door |
| History | None | Rich |
| Friends | **None** | Nandi, Thabo, Aisha + others |
| Passport | **Does not exist** | Full |
| Plans | Empty at first, one item after | Three items, two with friends |
| Persona | Generated live, lightweight | Pre-set, richer |
| Cities | Cape Town | Cape Town + Tokyo |

**This is the most common thing designers miss here:** judge mode has no avatar stacks,
no "three people you know are going", no invite recipients. Every component that shows
social proof needs a designed no-friends variant that doesn't look broken or sad.

---

## 6. Screens to design

### Priority 1 — on the demo path, must exist

| # | Screen | Modes | Notes |
|---|---|---|---|
| 1 | Splash | both | Wordmark moment. First thing the room sees. |
| 2 | Sign in | both | **Three doors.** "I'm a hackathon judge" is a real, visible button — design it as a deliberate, slightly special affordance, not a debug link. Google door and email below it. |
| 3 | Interests | judge | Chip multi-select, 3+ required. Must be completable in ~15 seconds. Around 8–10 chips, no scrolling. |
| 4 | Persona loading | judge | 2–4 seconds, on stage. Make the wait feel like the app is thinking about *them*. |
| 5 | Persona card | judge | "We think you're into food and fitness." Light, warm, non-reductive. Recognition, not analytics. Must not feel like a personality test result. |
| 6 | Discover — feed | both | Header with time/place context, persona line, Feed/Map toggle, **"Find places for me"** button, event cards. Active mode adds friend activity. |
| 7 | Discover — map | both | Clustered pins + tap-to-sheet. |
| 8 | Event detail | both | Photo, time, distance, price, blurb, attendee stack (active only), two actions: **I'm going** and **Let's go Places**. |
| 9 | Swipe deck | both | Six cards. See §7. |
| 10 | Deck end state | both | "Six seen · that's the lot." Summary of yeses. Explicitly refuses to continue. |
| 11 | Plan & invite sheet | active | Friend list, note field, send. |
| 12 | Invite sent / confirmed | active | |
| 13 | **Invite received** | active | **New — not in v3.** This renders on the second phone, held up to the audience. It has one job: read as a notification from across a room. Large, immediate, unmistakable. |
| 14 | Plans | both | Populated (active) and empty (judge). |
| 15 | Passport | active only | Static. Stamps, places, stats. |
| 16 | Tokyo state | active | See §8. |

### Priority 2 — build if time

| 17 | Organiser view | One screen, static. An event with an interest count, plus an inert "create event" form. Two seconds of pitch. |
| 18 | Discover loading | Brief. |
| 19 | Discover empty | Only appears if something goes wrong — design it anyway, it's the best copy in the app. |

### Do not design

Settings · friend management · profile editing · search results · notifications inbox ·
onboarding for businesses · anything with a keyboard beyond the invite note field.

---

## 7. The swipe deck — the signature interaction

Triggered by **"Find places for me"** on Discover, in both modes.

- Six cards, ranked to the persona. Never refills.
- **Horizontal only.** Left = pass, right = yes. Save is a **button on the card**, not a
  swipe-up gesture (vertical drag fights iOS overscroll).
- Each card carries **one reason line** explaining why it was picked — this is the visible
  output of the AI and it's what makes the feature feel intelligent rather than random.
  Design that line prominently. It's the single most important piece of text in the app.
- Design the mid-swipe state: what appears behind, what the release threshold looks like.
- Counter ("2 of 6") is a promise that it ends. Keep it visible.

---

## 8. Tokyo — the "one more thing"

Late in Demo 2, the map moves to Tokyo and the same curated experience appears in a
foreign city. The narrative: *you land somewhere you've never been and you're not lost.*

Design what signals the shift — a city header, a transition, a different tonal register
in the copy. Keep the components identical. Times render in Tokyo local time with an
explicit label (a Cape Town user seeing "19:00 JST" is the point, not a bug).

---

## 9. The closing beat

The final action in the demo is **"Let's go Places"** on an event starting in ~20 minutes.
It opens Apple Maps and the phone leaves the app.

That button is the thesis of the entire product. It should be the most confident thing on
the screen. Design what the app shows in the half-second before it hands off — a
deliberate goodbye, not a spinner.

---

## 10. Deliverables

1. All Priority 1 screens at 390 × 844, in both modes where §5 says they differ.
2. The no-friends variants of every socially-loaded component.
3. A token sheet that a developer can transcribe into Tailwind v4 theme variables
   directly — exact values, no "roughly this purple".
4. Motion notes for: interest chip selection, persona reveal, card swipe, invite arrival,
   and the maps handoff. One line each, describing intent rather than easing curves.

**Sequence the delivery in demo order** (Splash → Sign in → Interests → Persona →
Discover → Event detail → Deck → Plan sheet → Plans → Passport → Tokyo), because the
build follows the same order and the developers will consume them as they land.
