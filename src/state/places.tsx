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
} from "@/data/seed";
import { fallbackPersona as buildFallback, localReason, rankLocally } from "@/data/rank";
import { distanceKm } from "@/data/geo";
import { minutesUntil } from "@/data/schedule";
import { supabaseInvites } from "@/lib/supabase";

type DeviceUser = { id: string; name: string; initials: string };
type DeckVerdict = "yes" | "saved" | "pass";

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
      if (storedMode === "judge" || storedMode === "active") setMode(storedMode);
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
      setReady(true);
    });
  }, []);

  const signIn = useCallback((m: Mode) => {
    setMode(m);
    persist(STORAGE.mode, m);
    const device = read<DeviceUser>(STORAGE.device);
    if (m === "judge") {
      const u: DeviceUser = { id: "judge", name: "Judge", initials: "J" };
      setUser(u);
      persist(STORAGE.user, u);
      setPlans([]);
      persist(STORAGE.plans, []);
      setInvites([]);
      persist(STORAGE.invites, []);
      setInterestsState([]);
      persist(STORAGE.interests, []);
      setPersona(null);
      persist(STORAGE.persona, null);
      setDeckPicks({});
      persist(STORAGE.deckPicks, {});
      setCityState("cape-town");
      persist(STORAGE.city, "cape-town");
      setAreaState(null);
      persist(STORAGE.area, null);
      setRadiusState(10);
      persist(STORAGE.radius, 10);
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
      setPersona(null);
      persist(STORAGE.persona, null);
    }
  }, []);

  const setInterests = useCallback((tags: InterestTag[]) => {
    setInterestsState(tags);
    persist(STORAGE.interests, tags);
  }, []);

  const requestPersona = useCallback(async () => {
    setPersonaLoading(true);
    persist(STORAGE.personaLoading, true);
    const candidates = placesIn("cape-town").map((p) => ({
      id: p.id,
      title: p.title,
      tags: p.tags as string[],
      startOffset: minutesUntil(p),
      distanceKm: distanceKm(CITIES["cape-town"].center, p),
      price: p.price,
    }));
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, city: "cape-town", candidates }),
      });
      if (!res.ok) throw new Error(`persona ${res.status}`);
      const data = (await res.json()) as PersonaResult;
      setPersona(data);
      persist(STORAGE.persona, data);
    } catch {
      const fb = buildFallback(placesIn("cape-town"), interests);
      setPersona(fb);
      persist(STORAGE.persona, fb);
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

  const distanceTo = useCallback(
    (place: Place) => distanceKm(CITIES[city].center, place),
    [city],
  );

  const rankedForMode = useMemo(() => {
    const list = placesIn(city);
    if (mode === "judge" && persona) {
      const order = persona.ranked.map((r) => r.eventId);
      return [...list].sort((a, b) => {
        const ia = order.indexOf(a.id);
        const ib = order.indexOf(b.id);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
    }
    return rankLocally(list, mode === "active" ? ACTIVE_PERSONA.tags : interests);
  }, [mode, persona, city, interests]);

  const events = useMemo(() => {
    let list = rankedForMode;
    if (area) list = list.filter((p) => p.area === area);
    if (radiusKm != null) list = list.filter((p) => distanceKm(CITIES[city].center, p) <= radiusKm);
    return list;
  }, [rankedForMode, area, radiusKm, city]);

  const deckEvents = useMemo(() => rankedForMode.filter((p) => p.kind === "event").slice(0, 6), [rankedForMode]);

  const reasonFor = useCallback(
    (placeId: string) => {
      if (mode === "active") {
        const pre = ACTIVE_RANKED.find((r) => r.eventId === placeId);
        if (pre) return pre.reason;
        const place = placeById(placeId);
        return place ? localReason(place, ACTIVE_PERSONA.tags) : "On tonight.";
      }
      const hit = persona?.ranked.find((r) => r.eventId === placeId);
      if (hit) return hit.reason;
      const place = placeById(placeId);
      return place ? localReason(place, interests) : "On tonight.";
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
  };

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces(): PlacesContextValue {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error("usePlaces must be used inside PlacesProvider");
  return ctx;
}
