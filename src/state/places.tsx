"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACTIVE_PERSONA,
  ACTIVE_PASSPORT,
  ACTIVE_RANKED,
  AMEER_PLANS,
  ATTENDANCE,
  ATTENDANCE_BASE,
  CITIES,
  DEVICE_USERS,
  FRIENDS,
  ME_ACTIVE,
  STORAGE,
  activePlans,
  personById,
  placeById,
  placesIn,
  type Attendance,
  type City,
  type Invite,
  type Mode,
  type Passport,
  type PersonaResult,
  type Person,
  type Place,
  type Plan,
  type InterestTag,
  RICOCHETS,
  type Ricochet,
} from "@/data/seed";
import {
  BUSINESS, EMPTY_DRAFT, draftToPlace, registerPlaces, type EventDraft,
} from "@/data/seed";
import { fallbackPersona as buildFallback, localReason, rankLocally } from "@/data/rank";
import { distanceKm } from "@/data/geo";
import { supabaseInvites } from "@/lib/supabase";

type DeviceUser = { id: string; name: string; initials: string };
type DeckVerdict = "yes" | "pass";

type PlacesContextValue = {
  ready: boolean;
  mode: Mode | null;
  user: DeviceUser | null;
  /** Ranking matches on the twelve onboarding chips only — src/data/vocab.ts. */
  interests: InterestTag[];
  personaLoading: boolean;
  persona: PersonaResult | null;
  city: City;
  area: string | null;
  radiusKm: number | null;
  events: Place[];
  deckEvents: Place[];
  friends: Person[];
  plans: Plan[];
  invites: Invite[];
  pendingInvite: { invite: Invite; from: Person; place: Place } | null;
  passport: Passport | null;
  deckPicks: Record<string, DeckVerdict>;
  attendanceFor: (placeId: string) => Attendance;
  /** placeId → friends going. Stable identity, so the map can keep it in a dep array. */
  friendCounts: Record<string, number>;
  /** stampId → the photo the user picked, as a downscaled data URL. */
  stampPhotos: Record<string, string>;
  setStampPhoto: (stampId: string, dataUrl: string) => void;
  /** Seed ricochets plus the ones chained in the app, newest of yours first. */
  ricochets: Ricochet[];
  publishRicochet: (r: Ricochet) => void;
  /** Copy a ricochet's stops into Plans. Never touches the original. */
  takeRicochet: (id: string) => number;
  distanceTo: (place: Place) => number;
  reasonFor: (placeId: string) => string;
  signIn: (mode: Mode) => void;
  setInterests: (tags: InterestTag[]) => void;
  requestPersona: () => Promise<void>;
  addPlan: (placeId: string, status: Plan["status"], withPeople?: string[]) => void;
  removePlan: (placeId: string) => void;
  planFor: (placeId: string) => Plan | undefined;
  sendInvite: (placeId: string, toUserIds: string[], note: string) => Promise<void>;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  pollInvites: () => Promise<void>;
  simulateIncomingInvite: (fromId?: string, placeId?: string) => void;
  setCity: (city: City) => void;
  setArea: (area: string | null) => void;
  setRadiusKm: (km: number | null) => void;
  markDeck: (placeId: string, verdict: DeckVerdict) => void;
  /** Events this business created live, in this app. Real Places (§1.5, localStorage). */
  myEvents: Place[];
  draft: EventDraft;
  setDraft: (d: EventDraft) => void;
  publishDraft: () => Place;
};

const PlacesContext = createContext<PlacesContextValue | null>(null);

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — the demo keeps running from memory
  }
}

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [user, setUser] = useState<DeviceUser | null>(null);
  const [interests, setInterestsState] = useState<InterestTag[]>([]);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [persona, setPersona] = useState<PersonaResult | null>(null);
  const [city, setCityState] = useState<City>("cape-town");
  const [area, setAreaState] = useState<string | null>(null);
  const [radiusKm, setRadiusState] = useState<number | null>(10);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [deckPicks, setDeckPicks] = useState<Record<string, DeckVerdict>>({});
  const [myEvents, setMyEvents] = useState<Place[]>([]);
  const [stampPhotos, setStampPhotos] = useState<Record<string, string>>({});
  const [myRicochets, setMyRicochets] = useState<Ricochet[]>([]);
  const [draft, setDraftState] = useState<EventDraft>(EMPTY_DRAFT);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Hydrate once. A device param (?as=ameer) pins that identity permanently.
  useEffect(() => {
    queueMicrotask(() => {
      const asParam = new URLSearchParams(window.location.search).get("as");
      let device: DeviceUser | null = read<DeviceUser>(STORAGE.device);
      if (asParam && asParam in DEVICE_USERS) {
        const du = DEVICE_USERS[asParam as keyof typeof DEVICE_USERS];
        device = { id: du.id, name: du.name, initials: du.initials };
        persist(STORAGE.device, device);
      }
      const storedMode = read<Mode>(STORAGE.mode);
      const storedUser = read<DeviceUser>(STORAGE.user);
      if (storedMode === "business" || storedMode === "active") setMode(storedMode);
      if (device && storedMode === "active") {
        setUser(device);
        const seeded = AMEER_PLANS.map((p, i) => ({
          ...p,
          createdAtMs: Date.now() - (i + 1) * 3600_000,
        }));
        setPlans(seeded);
        persist(STORAGE.plans, seeded);
      } else if (storedUser) {
        setUser(storedUser);
      }
      const storedInterests = read<InterestTag[]>(STORAGE.interests);
      if (storedInterests) setInterestsState(storedInterests);
      const storedPersona = read<PersonaResult>(STORAGE.persona);
      if (storedPersona) setPersona(storedPersona);
      persist(STORAGE.personaLoading, false);
      const storedPlans = read<Plan[]>(STORAGE.plans);
      if (storedPlans && !(device && storedMode === "active")) setPlans(storedPlans);
      const storedCity = read<City>(STORAGE.city);
      if (storedCity === "cape-town" || storedCity === "tokyo") setCityState(storedCity);
      const storedArea = read<string | null>(STORAGE.area);
      if (storedArea !== null && storedArea !== undefined) setAreaState(storedArea);
      const storedRadius = read<number | null>(STORAGE.radius);
      if (storedRadius !== null && storedRadius !== undefined) setRadiusState(storedRadius);
      const storedInvites = read<Invite[]>(STORAGE.invites);
      if (storedInvites) setInvites(storedInvites);
      const storedPicks = read<Record<string, DeckVerdict>>(STORAGE.deckPicks);
      if (storedPicks) setDeckPicks(storedPicks);
      const storedMine = read<Place[]>(STORAGE.myEvents);
      if (storedMine) {
        setMyEvents(storedMine);
        // Before setReady, so the first rendered frame can already resolve them.
        registerPlaces(storedMine);
      }
      const storedDraft = read<EventDraft>(STORAGE.draft);
      if (storedDraft) setDraftState(storedDraft);
      const storedPhotos = read<Record<string, string>>(STORAGE.stampPhotos);
      if (storedPhotos) setStampPhotos(storedPhotos);
      const storedRicochets = read<Ricochet[]>(STORAGE.ricochets);
      if (storedRicochets) setMyRicochets(storedRicochets);
      setReady(true);
    });
  }, []);

  const signIn = useCallback((m: Mode) => {
    setMode(m);
    persist(STORAGE.mode, m);
    const device = read<DeviceUser>(STORAGE.device);
    if (m === "business") {
      // No onboarding, no persona, no plans — a business only ever sees its own shelf.
      const u: DeviceUser = {
        id: BUSINESS.id,
        name: BUSINESS.name,
        initials: BUSINESS.initials,
      };
      setUser(u);
      persist(STORAGE.user, u);
      setCityState("cape-town");
      persist(STORAGE.city, "cape-town");
      setDraftState(EMPTY_DRAFT);
      persist(STORAGE.draft, EMPTY_DRAFT);
    } else {
      const u: DeviceUser = device ?? {
        id: ME_ACTIVE.id,
        name: ME_ACTIVE.name,
        initials: ME_ACTIVE.initials,
      };
      setUser(u);
      persist(STORAGE.user, u);
      const seeded = device
        ? AMEER_PLANS.map((p, i) => ({ ...p, createdAtMs: Date.now() - (i + 1) * 3600_000 }))
        : activePlans();
      setPlans(seeded);
      persist(STORAGE.plans, seeded);
      // Onboarding runs for this door too — start it empty every time.
      setPersona(null);
      persist(STORAGE.persona, null);
      setInterestsState([]);
      persist(STORAGE.interests, []);
      setDeckPicks({});
      persist(STORAGE.deckPicks, {});
    }
  }, []);

  const setInterests = useCallback((tags: InterestTag[]) => {
    setInterestsState(tags);
    persist(STORAGE.interests, tags);
  }, []);

  /**
   * The one model call in the app. It returns PROSE ONLY — the label and the sentence
   * on the persona card. Ordering and reason lines are composed here from the local
   * ranking, which is what has always actually driven them, so nothing the model says
   * can move an event or invent a reason.
   */
  const requestPersona = useCallback(async () => {
    setPersonaLoading(true);
    persist(STORAGE.personaLoading, true);
    const local = buildFallback(placesIn("cape-town"), interests);
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!res.ok) throw new Error(`persona ${res.status}`);
      const prose = (await res.json()) as {
        label?: string;
        sentence?: string;
        fallback?: boolean;
      };
      const data: PersonaResult = {
        ...local,
        label: prose.label ?? local.label,
        sentence: prose.sentence ?? local.sentence,
        fallback: prose.fallback !== false,
      };
      setPersona(data);
      persist(STORAGE.persona, data);
    } catch {
      setPersona(local);
      persist(STORAGE.persona, local);
    } finally {
      setPersonaLoading(false);
      persist(STORAGE.personaLoading, false);
    }
  }, [interests]);

  const addPlan = useCallback(
    (placeId: string, status: Plan["status"], withPeople: string[] = []) => {
      setPlans((prev) => {
        const next = [
          ...prev.filter((p) => p.placeId !== placeId),
          { id: `plan-${Date.now()}`, placeId, withPeople, status, createdAtMs: Date.now() },
        ];
        persist(STORAGE.plans, next);
        return next;
      });
    },
    [],
  );

  /**
   * Remix. Copies a ricochet's stops into your own Plans as ordinary plans, so you
   * can cut and reorder them without the original changing under whoever chained it.
   * Returns how many stops were new — a stop you were already going to is left alone.
   */
  const takeRicochet = useCallback(
    (id: string) => {
      const ricochet = [...myRicochets, ...RICOCHETS].find((r) => r.id === id);
      if (!ricochet) return 0;
      // Counted here, off the current plans, rather than inside the state updater —
      // an updater's body runs when React decides to and twice under StrictMode, so
      // anything read out of it to return to the caller is unreliable.
      const have = new Set(plans.map((p) => p.placeId));
      const extra = ricochet.stops
        .filter((stop) => placeById(stop.placeId) && !have.has(stop.placeId))
        .map((stop, i) => ({
          id: `plan-ric-${id}-${stop.placeId}`,
          placeId: stop.placeId,
          withPeople: [] as string[],
          status: "going" as const,
          createdAtMs: Date.now() + i,
        }));
      if (extra.length > 0) {
        const next = [...plans, ...extra];
        setPlans(next);
        persist(STORAGE.plans, next);
      }
      return extra.length;
    },
    [myRicochets, plans],
  );

  const removePlan = useCallback((placeId: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.placeId !== placeId);
      persist(STORAGE.plans, next);
      return next;
    });
  }, []);

  const sendInvite = useCallback(async (placeId: string, toUserIds: string[], note: string) => {
    const me = userRef.current;
    const sb = supabaseInvites();
    if (!sb || toUserIds.length === 0) return;
    const { error } = await sb.from("invites").insert(
      toUserIds.map((to) => ({ from_user: me?.id ?? "sam", to_user: to, event_id: placeId, note })),
    );
    if (error) console.warn("invite insert failed — local beat still lands", error.message);
  }, []);

  const pollInvites = useCallback(async () => {
    const me = userRef.current;
    if (!me) return;
    const sb = supabaseInvites();
    if (!sb) return;
    const { data, error } = await sb
      .from("invites")
      .select("*")
      .eq("to_user", me.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error || !data) return;
    setInvites((prev) => {
      const known = new Set(prev.map((i) => i.id));
      const fresh = data
        .filter((r) => !known.has(r.id))
        .map(
          (r): Invite => ({
            id: r.id,
            fromUser: r.from_user,
            toUser: r.to_user,
            placeId: r.event_id,
            note: r.note ?? "",
            createdAtMs: new Date(r.created_at).getTime(),
          }),
        );
      if (fresh.length === 0) return prev;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(80);
      const next = [...fresh, ...prev];
      persist(STORAGE.invites, next);
      return next;
    });
  }, []);

  const simulateIncomingInvite = useCallback((fromId = "sam", placeId?: string) => {
    const me = userRef.current;
    if (!me) return;
    const invite: Invite = {
      id: `local-${Date.now()}`,
      fromUser: fromId,
      toUser: me.id,
      placeId: placeId ?? "ct-clay-hands",
      note: "",
      createdAtMs: Date.now(),
    };
    setInvites((prev) => {
      const next = [invite, ...prev];
      persist(STORAGE.invites, next);
      return next;
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(80);
  }, []);

  const removeFromInvites = useCallback((inviteId: string) => {
    setInvites((prev) => {
      const next = prev.filter((i) => i.id !== inviteId);
      persist(STORAGE.invites, next);
      return next;
    });
  }, []);

  const acceptInvite = useCallback(
    (inviteId: string) => {
      const invite = invites.find((i) => i.id === inviteId);
      if (!invite) return;
      removeFromInvites(inviteId);
      addPlan(invite.placeId, "going", [invite.fromUser]);
    },
    [invites, removeFromInvites, addPlan],
  );

  const declineInvite = useCallback(
    (inviteId: string) => removeFromInvites(inviteId),
    [removeFromInvites],
  );

  const setCity = useCallback((c: City) => {
    setCityState(c);
    persist(STORAGE.city, c);
    setAreaState(null);
    persist(STORAGE.area, null);
  }, []);

  const setArea = useCallback((a: string | null) => {
    setAreaState(a);
    persist(STORAGE.area, a);
  }, []);

  const setRadiusKm = useCallback((km: number | null) => {
    setRadiusState(km);
    persist(STORAGE.radius, km);
  }, []);

  const markDeck = useCallback((placeId: string, verdict: DeckVerdict) => {
    setDeckPicks((prev) => {
      const next = { ...prev, [placeId]: verdict };
      persist(STORAGE.deckPicks, next);
      return next;
    });
  }, []);

  const setDraft = useCallback((d: EventDraft) => {
    setDraftState(d);
    persist(STORAGE.draft, d);
  }, []);

  /**
   * The draft becomes a real Place. It joins the registry so every existing
   * placeById() call site resolves it, and the consumer feed and map pick it up.
   */
  const publishDraft = useCallback((): Place => {
    const place = draftToPlace(draft, `tm-${Date.now()}`);
    const next = [...myEvents.filter((p) => p.id !== place.id), place];
    setMyEvents(next);
    registerPlaces(next);
    persist(STORAGE.myEvents, next);
    // Deliberately does NOT clear the draft. Clearing it here flipped the preview
    // page into its "nothing drafted" state, which redirected to the form and beat
    // the push to the report. The dashboard resets the draft on the way in instead.
    return place;
  }, [draft, myEvents]);

  const friends = mode === "active" ? FRIENDS : [];

  // ponytail: going and saved are one row, so a place is either/or — bookmarking a
  // plan you're going to is a no-op by design. Split into two lists if that changes.
  const planFor = useCallback(
    (placeId: string) => plans.find((p) => p.placeId === placeId),
    [plans],
  );

  const attendanceFor = useCallback(
    (placeId: string): Attendance => ({
      base: ATTENDANCE_BASE[placeId] ?? 0,
      // The judge has no friends (AGENTS.md §1.3) — a fresh account must never see
      // Sam's people on a card. Mode changes the data, not the markup (§1.7), so the
      // cards fall back to the head-count line on their own.
      friends:
        mode === "active"
          ? (ATTENDANCE[placeId] ?? [])
              .map((id) => personById(id))
              .filter((p): p is Person => Boolean(p))
          : [],
    }),
    [mode],
  );

  /**
   * The +N bubble on a map marker. Seeded attendance plus anyone you have since
   * made a plan with, so an invite sent during the demo shows up on the map too.
   * Memoised because the map takes it as an effect dependency — rebuilt every
   * render, it would tear down and recreate every marker on every render.
   */
  const friendCounts = useMemo(() => {
    // A fresh account has no friends (AGENTS.md §1.3) and must show no social proof.
    if (mode !== "active") return {};
    // Union per place, so someone who is both seeded and on a plan counts once.
    const byPlace = new Map<string, Set<string>>();
    const add = (placeId: string, ids: string[]) => {
      const set = byPlace.get(placeId) ?? new Set<string>();
      ids.filter((id) => personById(id)).forEach((id) => set.add(id));
      byPlace.set(placeId, set);
    };
    Object.entries(ATTENDANCE).forEach(([placeId, ids]) => add(placeId, ids));
    plans.forEach((p) => add(p.placeId, p.withPeople));

    const out: Record<string, number> = {};
    byPlace.forEach((set, placeId) => {
      if (set.size > 0) out[placeId] = set.size;
    });
    return out;
  }, [mode, plans]);

  const setStampPhoto = useCallback((stampId: string, dataUrl: string) => {
    setStampPhotos((prev) => {
      const next = { ...prev, [stampId]: dataUrl };
      // A picked photo is the largest thing this app stores. persist() swallows a
      // quota error, which is the right call — the card still works from memory for
      // the rest of the session, it just will not survive a cold reload.
      persist(STORAGE.stampPhotos, next);
      return next;
    });
  }, []);

  const publishRicochet = useCallback((r: Ricochet) => {
    setMyRicochets((prev) => {
      const next = [{ ...r, mine: true }, ...prev.filter((x) => x.id !== r.id)];
      persist(STORAGE.ricochets, next);
      return next;
    });
  }, []);

  const ricochets = useMemo(() => [...myRicochets, ...RICOCHETS], [myRicochets]);

  const distanceTo = useCallback(
    (place: Place) => distanceKm(CITIES[city].center, place),
    [city],
  );

  const ranked = useMemo(() => {
    const list = [...placesIn(city), ...myEvents.filter((p) => p.city === city)];
    if (persona) {
      const order = persona.ranked.map((r) => r.eventId);
      return [...list].sort((a, b) => {
        const ia = order.indexOf(a.id);
        const ib = order.indexOf(b.id);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
    }
    // No persona yet (onboarding skipped, or a cold reload mid-flow).
    return rankLocally(list, interests.length > 0 ? interests : ACTIVE_PERSONA.tags);
  }, [persona, city, interests, myEvents]);

  const events = useMemo(() => {
    let list = ranked;
    if (area) list = list.filter((p) => p.area === area);
    if (radiusKm != null) {
      // Events put on inside the app are exempt from the radius. The business that
      // created one has to be able to see it land, and Muizenberg is 20 km from the
      // default centre — it would otherwise be filtered out of its own demo.
      const mine = new Set(myEvents.map((p) => p.id));
      list = list.filter(
        (p) => mine.has(p.id) || distanceKm(CITIES[city].center, p) <= radiusKm,
      );
    }
    return list;
  }, [ranked, area, radiusKm, city, myEvents]);

  const deckEvents = useMemo(() => ranked.filter((p) => p.kind === "event").slice(0, 6), [ranked]);

  const reasonFor = useCallback(
    (placeId: string) => {
      const live = persona?.ranked.find((r) => r.eventId === placeId);
      if (live) return live.reason;
      const place = placeById(placeId);
      if (!place) return "On tonight.";
      if (mode === "active") {
        const pre = ACTIVE_RANKED.find((r) => r.eventId === placeId);
        if (pre) return pre.reason;
      }
      return localReason(place, interests.length > 0 ? interests : ACTIVE_PERSONA.tags);
    },
    [mode, persona, interests],
  );

  const passport = mode === "active" ? ACTIVE_PASSPORT : null;

  const pendingInvite = useMemo(() => {
    const invite = invites[0];
    if (!invite) return null;
    const from = personById(invite.fromUser);
    const place = placeById(invite.placeId);
    if (!from || !place) return null;
    return { invite, from, place };
  }, [invites]);

  const value: PlacesContextValue = {
    ready,
    mode,
    user,
    interests,
    personaLoading,
    persona,
    city,
    area,
    radiusKm,
    events,
    deckEvents,
    friends,
    plans,
    invites,
    pendingInvite,
    passport,
    deckPicks,
    attendanceFor,
    friendCounts,
    stampPhotos,
    setStampPhoto,
    ricochets,
    publishRicochet,
    takeRicochet,
    distanceTo,
    reasonFor,
    signIn,
    setInterests,
    requestPersona,
    addPlan,
    removePlan,
    planFor,
    sendInvite,
    acceptInvite,
    declineInvite,
    pollInvites,
    simulateIncomingInvite,
    setCity,
    setArea,
    setRadiusKm,
    markDeck,
    myEvents,
    draft,
    setDraft,
    publishDraft,
  };

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces(): PlacesContextValue {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error("usePlaces must be used inside PlacesProvider");
  return ctx;
}
