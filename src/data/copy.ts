// copy.ts — every user-facing string that isn't event data.
//
// The voice is the product. Warmth through words, not mascots. The app's job is to
// end the session: several of these strings actively tell the user to leave.
// Do not let an agent "improve" them into product-speak.

export const COPY = {
  splash: {
    wordmark: 'places',
    line: 'Get out, off your phone and to the places that make you feel alive.',
    cta: 'Explore Places',
  },
  signIn: {
    title: 'Come in.',
    sub: "No profile to build, no bio to write. Two taps and you're looking at tonight.",
    judgeDoor: "I'm a hackathon judge",
    googleDoor: 'Continue with Google',
    emailDoor: 'Use an email address',
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
    title: 'Having a look at what suits you…',
    sub: "Checking what's on, and what's actually worth leaving the house for.",
  },
  persona: {
    kicker: 'BASED ON WHAT YOU PICKED',
    accept: 'That sounds about right',
    reject: 'Not me',
    footnote: "That's not a score — it's just a starting point.",
  },
  discover: {
    findForMe: 'Find places for me',
    findForMeSub: 'Six picks, about a minute',
    nearbyHeading: "What's on near you",
    radiusLabel: 'WITHIN 6 KM',
    feedTab: 'Feed',
    mapTab: 'Map',
    loadingTitle: 'Having a look around you…',
    loadingSub: "Checking what's still got space tonight.",
    emptyTitle: 'Quiet night out there.',
    emptySub:
      'Nothing within 6km worth leaving the house for. Tomorrow evening looks much better.',
    emptyFootnote: "Or put the phone down — that's a perfectly good evening too.",
  },
  deck: {
    counter: (i: number, total: number) => `${i} OF ${total}`,
    hint: 'Swipe right for yes, left to pass',
    save: 'Save for later',
    releaseYes: 'RELEASE TO SAY YES',
    endTitle: "Six seen · that's the lot",
    endFootnote: "No more cards tonight. That's on purpose.",
    endBack: 'Back to Discover',
  },
  event: {
    going: "I'm going",
    plan: 'Invite friends',
    directions: "Let's go Places",
    startsIn: (m: number) => (m < 60 ? `Starts in ${m} min` : `Starts in ${Math.round(m / 60)} hrs`),
  },
  invite: {
    title: "Who's coming?",
    notePlaceholder: 'Add a note — "meet at the pavilion?"',
    send: (n: number) => `Send to ${n} ${n === 1 ? 'friend' : 'friends'}`,
    sentTitle: "You're going, and so are they.",
    sentSub: "We'll nudge them 45 minutes before — nothing else from us.",
    close: 'Done — close the app',
  },
  inviteReceived: {
    // Rendered on the SECOND phone and held up to a room. Read from three metres.
    kicker: 'NEW INVITE',
    title: (name: string) => `${name} wants you there.`,
    accept: "I'm in",
    decline: 'Not this time',
  },
  plans: {
    title: 'Plans',
    subSome: 'Three things, none of them urgent.',
    emptyTitle: 'Nothing in the diary. Enjoy it while it lasts.',
    emptySub:
      'When you say yes to something it lands here — with the time, the place, and who else is in. Nothing else.',
    emptyCta: "See what's on tonight",
    alone: 'going alone, which is fine',
  },
  tokyo: {
    kicker: 'ONE MORE THING',
    title: "You land on Tuesday. You've never been.",
    sub: 'Same app, same taste, 14,800 km away.',
  },
  nav: { discover: 'Discover', plans: 'Plans', profile: 'Profile' },
} as const
