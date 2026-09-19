// copy.ts — every user-facing string that isn't event data.
//
// The voice is the product. Warmth through words, not mascots. The app's job is to
// end the session: several of these strings actively tell the user to leave.
// Strings follow the Places4 screen handoff; do not let an agent "improve" them.
//
// MERGE NOTE (FIXES.md §2). FIXES said "where wording differs, the dropped version
// wins". It was not applied, because the dropped file is demonstrably the EARLIER
// draft, not the later one:
//   · its wordmark is 'places' and its CTA 'Explore Places'; the Phase-4 screen
//     handoff ("Places4 - Screens.dc.html") says 'bounce' / 'Jump In'
//   · it has no appleDoor, no deck end block, no passport, location, handoff or
//     Tokyo copy — all of which are on screen today and in the handoff set
//   · every string it has that differs is a screen the handoff set redrew
// Taking it would have regressed live screens away from the design. The keys it had
// that nothing renders (signIn.emailDoor, discover.loadingTitle/Sub, deck.hint,
// plans.subSome, invite.close, persona.reject) were left out rather than added as
// dead strings — see AGENTS.md §1.1.

const NUMBER_WORDS: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
}

export const COPY = {
  splash: {
    wordmark: 'bounce',
    line: 'Get out, off your phone and to the places that make you feel alive.',
    cta: 'Jump In',
  },
  signIn: {
    title: "Let's bounce.",
    sub: "No profile to build, no bio to write. Two taps and you're looking at tonight.",
    appleDoor: 'Continue with Apple',
    googleDoor: 'Continue with Google',
    judgeDoor: "I'm a Business",
    footnote: "We'll only ever show your first name and the events you say yes to.",
  },
  interests: {
    step: '1 / 2',
    title: 'What pulls you out of the house?',
    sub: 'Pick three or more. You can change these whenever.',
    ctaLocked: 'Pick three to carry on',
    ctaReady: 'Three picked — carry on',
    skip: 'Skip',
  },
  personaLoading: {
    building: 'Building your evening.',
    sub: "Not a personality test — just working out what you'd actually get up for.",
  },
  persona: {
    kicker: (labels: string[]) =>
      labels.length > 0 ? `${labels.join(', ')} said yes to` : 'Your picks said yes to',
    accept: "Let's jump in",
    footnote: "This shifts every time you say yes or no to something — it's a read, not a label.",
  },
  discover: {
    findForMe: "What's Bouncing?",
    findForMeSub: 'Six picks, new to you',
    nearbyHeading: "What's on near you",
    radiusLabel: (km: number | null) => (km == null ? 'ANY DISTANCE' : `WITHIN ${km} KM`),
    feedTab: 'Feed',
    mapTab: 'Map',
    pinHint: 'TAP A PIN FOR DETAIL',
    pinSummary: (n: number, km: number | null) =>
      km == null ? `${n} things within range` : `${n} things within ${km} km`,
    emptyTitle: 'Quiet night out there.',
    emptySub:
      'Nothing within range worth leaving the house for. Tomorrow evening looks much better.',
    emptyFootnote: "Or put the phone down — that's a perfectly good evening too.",
  },
  bounce: {
    // The control on the map. Not "Bounce this lot" from the handoff — that was
    // written when a bounce threw the whole set back; now it lands on one place.
    cta: 'Bounce it',
    title: 'Bounced.',
    sub: "Nothing you'd have picked. That's the point — it's two minutes of your evening.",
    why: 'Nothing you have tapped looks like this.',
    whyTagged: (tag: string) => `You have never once picked ${tag.replace('-', ' ')}.`,
    reasonsHeading: 'Not for you?',
    reasons: [
      'Too far', 'Too late', 'Not my thing', 'Seen it already',
      'Too much of a crowd', 'Costs too much',
    ] as const,
    check: 'Check it out',
    skip: 'Skip',
    exhausted: "That's every corner of the city you don't normally go to. Start again?",
  },
  business: {
    live: 'Live now',
    liveCount: (n: number) => `${n} ${n === 1 ? 'EVENT' : 'EVENTS'}`,
    past: 'Past',
    report: 'Report',
    last30: 'Last 30 days',
    // The handoff says "Put something on"; the brief renamed it.
    create: 'Drop something new',
    interestedGoing: (i: number, g: number) => `${i} interested · ${g} going`,
    seatsOf: (g: number, s: number) => `${g} of ${s} seats`,
    maybeList: (n: number) => `${n} on the maybe list`,
    pastLine: (up: number, going: number, pct: number) =>
      `${up} turned up of ${going} going · ${pct}%`,
    form: {
      cancel: 'Cancel',
      step: (i: number, n: number) => `Step ${i} of ${n}`,
      title: "What's happening?",
      name: 'Name',
      line: 'In a line',
      linePlaceholder: 'What someone should expect',
      namePlaceholder: 'Sunset supper club',
      date: 'Date',
      starts: 'Starts',
      shape: 'The shape of it',
      seats: 'Seats',
      perHead: 'Per head',
      photo: 'Photo',
      replace: 'Replace',
      reach: (n: number) => `Tagged this way, we'd show it to about ${n} people near you.`,
      cta: 'Preview the card',
      incomplete: 'Give it a name first',
    },
    preview: {
      kicker: 'Preview · nobody can see this yet',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    report_: {
      closed: (going: number, up: number) => `Closed · ${going} going · ${up} turned up`,
      liveState: (i: number, g: number) => `Live · ${i} interested · ${g} going`,
      turnUp: 'Turn-up rate',
      impressions: 'Impressions',
      saved: 'Saved',
      byDay: 'Interest by day',
      whoCame: 'Who came',
      nextKicker: "What we'd do next",
      again: 'Run it again',
      export: 'Export',
      dayAxis: ['-7', '-6', '-5', '-4', '-3', '-2', '-1', 'Day'] as const,
    },
  },
  deck: {
    close: 'Close',
    counter: (i: number, total: number) => `${i} OF ${total}`,
    // Both are icon-only controls now; these are their accessible names.
    pass: 'Pass',
    yes: 'Yes',
    endKicker: "Six seen · that's the lot",
    endFootnote: "No more cards tonight. That's on purpose. Or put the phone down — that's a perfectly good Tuesday too.",
    endSaved: 'Check them out',
    endClose: 'Done — close the app',
    endBack: 'Back to Discover',
  },
  event: {
    going: "I'm going",
    goingIn: "I'm in",
    plan: 'Invite friends',
    directions: "Let's Bounce",
    /** Undo the RSVP. Never 'Cancel' — you are not cancelling the event. */
    countMeOut: 'Count me out',
    statStarts: 'Starts',
    statCloses: 'Closes',
    statAway: 'Away',
    statCosts: 'Costs',
    startsIn: (m: number) => (m < 60 ? `Starts in ${m} min` : `Starts in ${Math.round(m / 60)} hrs`),
  },
  invite: {
    title: "Who's coming?",
    sub: (what: string, day: string, time: string) => `${what} · ${day.toLowerCase()}, ${time}`,
    notePlaceholder: 'Add a note — "meet at the pavilion?"',
    send: (n: number) => `Send to ${n} ${n === 1 ? 'friend' : 'friends'}`,
    sendNamed: (name: string) => `Invite ${name}`,
    sentKicker: (time: string) => `Invite sent · ${time}`,
    sentTitle: (n: number) =>
      n === 1
        ? "You're going, and so is one of them."
        : `You're going, and so are ${NUMBER_WORDS[n] ?? n} of them.`,
    // The nudge is the only notification this product ever sends, and the copy says
    // so out loud. Do not soften 'nothing else from us' into a marketing promise.
    sentBody: (names: string, nudgeAt: string) =>
      `${names} ${names.includes(' and ') ? 'have' : 'has'} it. We'll nudge them at ${nudgeAt} — nothing else from us.`,
    done: 'Done',
  },
  inviteReceived: {
    // Rendered on the SECOND phone and held up to a room. Read from three metres.
    kicker: 'New invite',
    title: (name: string, what: string) => `${name} wants you at ${what}.`,
    accept: "I'm in",
    decline: 'Not this time',
  },
  plans: {
    title: 'Plans',
    emptyTitle: 'Nothing lined up yet.',
    emptySub: 'Say yes to something on Discover and it lands here.',
    emptyCta: "See what's on tonight",
    alone: 'going alone, which is fine',
    yours: 'Already yours',
  },
  saved: {
    title: 'Saved',
    openLabel: 'Saved places',
    emptyTitle: 'Nothing saved yet.',
    emptySub: 'Say yes to something on the deck and it lands here.',
  },
  passport: {
    stats: ['Visits', 'With friends', 'Cities'] as const,
    stampsLabel: 'Stamps',
    more: (n: number) => `+${n}`,
    nextKicker: 'Next stamp',
    emptyTitle: 'Nothing here yet.',
    emptySub: 'Your passport starts with the first place you actually go to.',
  },
  tokyo: {
    chip: (time: string) => `Now in Tokyo · ${time}`,
    title: 'New city. Same read on you.',
    note: "You land somewhere new and you're still not lost — the picks just moved with you.",
    entryKicker: 'One more thing',
    back: 'Back to Cape Town',
  },
  handoff: {
    title: (m: number) => (m > 0 ? `Starts in ${m} minutes. Go.` : "It's starting now. Go."),
    sub: 'Opening Maps. This is where the app gets out of the way.',
  },
  location: {
    title: 'Where to look',
    searchPlaceholder: 'Search a suburb or city',
    useMyLocation: 'Use my location',
    useMyLocationSub: 'Cape Town',
    nearbyHeading: 'Nearby areas',
    areaMeta: (on: number, km: number) => `${on} on · ${km} km`,
    radiusHeading: 'Radius',
    radiusOptions: [
      { km: 3, label: '3 km' },
      { km: 6, label: '6 km' },
      { km: 10, label: '10 km' },
      { km: null, label: 'Any' },
    ] as const,
    cta: (area: string, km: number | null) =>
      km == null ? `Show ${area}, any distance` : `Show ${area}, ${km} km`,
  },
  nav: { discover: 'Discover', plans: 'Plans', profile: 'Profile' },
} as const
