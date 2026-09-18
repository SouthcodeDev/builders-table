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

export const COPY = {
  splash: {
    wordmark: 'bounce',
    line: 'Get out, off your phone and to the places that make you feel alive.',
    cta: 'Jump In',
  },
  signIn: {
    title: 'Come in.',
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
  deck: {
    close: 'Close',
    counter: (i: number, total: number) => `${i} OF ${total}`,
    save: 'Save for later',
    pass: 'Pass',
    yes: 'Yes',
    releaseYes: 'RELEASE TO SAY YES',
    releaseNote: '— save stays a tap on the card, never a gesture.',
    endKicker: "Six seen · that's the lot",
    endFootnote: "No more cards tonight. That's on purpose. Or put the phone down — that's a perfectly good Tuesday too.",
    endClose: 'Done — close the app',
    endBack: 'Back to Discover',
  },
  event: {
    going: "I'm going",
    goingIn: "I'm in",
    plan: 'Invite friends',
    directions: "Let's Bounce",
    startsIn: (m: number) => (m < 60 ? `Starts in ${m} min` : `Starts in ${Math.round(m / 60)} hrs`),
  },
  invite: {
    title: 'Bring people',
    notePlaceholder: 'Add a note (optional)',
    send: (n: number) => `Send to ${n} ${n === 1 ? 'friend' : 'friends'}`,
    sendNamed: (name: string) => `Invite ${name}`,
    sentTitle: (name: string) => `Sent to ${name}.`,
    sentSub: "It's waiting at the top of their Plans. You'll know the second they say yes.",
    backToPlans: 'Back to plans',
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
