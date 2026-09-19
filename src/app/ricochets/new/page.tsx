"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  COPY,
  PLACES,
  categoryFor,
  distanceKm,
  placeById,
  type Place,
  type Ricochet,
  type RicochetStop,
} from "@/data/seed";
import { TabBar } from "@/components/tab-bar";
import { usePlaces } from "@/state/places";

type Draft = RicochetStop & { key: string };

const ROW_H = 62; // row height + gap, matched to the markup below

/** 08:30, 10:00, 11:30 … so a fresh chain already reads like a day. */
const defaultTime = (i: number) => {
  const mins = 8 * 60 + 30 + i * 90;
  return `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};

export default function NewRicochetPage() {
  const router = useRouter();
  const { ready, city, user, publishRicochet } = usePlaces();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Ricochet["kind"]>("day");
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [stops, setStops] = useState<Draft[]>([]);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");

  // Drag-to-reorder. Pointer events, not HTML5 drag — dragstart never fires on iOS.
  const drag = useRef<{ from: number; startY: number } | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const resolved = useMemo(
    () =>
      stops
        .map((s) => ({ stop: s, place: placeById(s.placeId) }))
        .filter((x): x is { stop: Draft; place: Place } => Boolean(x.place)),
    [stops],
  );

  const km = useMemo(() => {
    let total = 0;
    for (let i = 1; i < resolved.length; i++) {
      total += distanceKm(resolved[i - 1].place, resolved[i].place);
    }
    return total;
  }, [resolved]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const chosen = new Set(stops.map((s) => s.placeId));
    return PLACES.filter(
      (p) =>
        p.city === city &&
        !chosen.has(p.id) &&
        (q === "" || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
    ).slice(0, 40);
  }, [query, city, stops]);

  if (!ready) return <main className="min-h-dvh flex-1 bg-surface" />;

  const addStop = (place: Place) => {
    setStops((prev) => [
      ...prev,
      {
        key: `${place.id}-${Date.now()}`,
        placeId: place.id,
        time: defaultTime(prev.length),
        note: place.blurb,
        travel: prev.length === 0 ? undefined : "a short hop",
      },
    ]);
    setPicking(false);
    setQuery("");
  };

  const onPointerDown = (e: React.PointerEvent, index: number, key: string) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { from: index, startY: e.clientY };
    setDraggingKey(key);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const moved = Math.round((e.clientY - d.startY) / ROW_H);
    if (moved === 0) return;
    const to = Math.max(0, Math.min(stops.length - 1, d.from + moved));
    if (to === d.from) return;
    setStops((prev) => {
      const next = [...prev];
      const [row] = next.splice(d.from, 1);
      next.splice(to, 0, row);
      return next;
    });
    // Re-baseline so the next threshold is measured from the new resting place.
    drag.current = { from: to, startY: e.clientY };
  };

  const endDrag = () => {
    drag.current = null;
    setDraggingKey(null);
  };

  const publish = () => {
    if (resolved.length === 0) return;
    const first = resolved[0].place;
    publishRicochet({
      id: `ric-mine-${Date.now()}`,
      title: title.trim() || COPY.ricochets.untitled,
      kind,
      city,
      authorName: user?.name ?? "You",
      authorInitials: user?.initials ?? "YOU",
      savedCount: 0,
      shape: [kind === "day" ? "ONE DAY" : "TRIP", ...(friendsOnly ? ["FRIENDS ONLY"] : [])],
      image: first.image,
      // Strip the local drag key — it is not part of the stored object.
      stops: resolved.map(({ stop }) => ({
        placeId: stop.placeId,
        time: stop.time,
        travel: stop.travel,
        note: stop.note,
      })),
    });
    router.push("/plans");
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-5 pt-safe">
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => router.back()}
              className="text-[14px] font-medium text-muted"
            >
              {COPY.ricochets.cancel}
            </button>
            <button
              onClick={publish}
              disabled={resolved.length === 0}
              className="text-[14px] font-medium text-pop disabled:opacity-35"
            >
              {COPY.ricochets.publish}
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={COPY.ricochets.namePlaceholder}
            aria-label={COPY.ricochets.namePlaceholder}
            // 16px minimum or iOS zooms the viewport on focus and never returns.
            className="mt-[18px] w-full bg-transparent text-[26px] font-medium tracking-[-0.02em] outline-none placeholder:text-ink-16"
          />
          <p className="mt-1.5 text-[13px] text-muted">{COPY.ricochets.reorderHint}</p>

          <div className="mt-4 flex gap-2">
            {(
              [
                [COPY.ricochets.oneDay, kind === "day", () => setKind("day")],
                [COPY.ricochets.aTrip, kind === "trip", () => setKind("trip")],
                [
                  COPY.ricochets.friendsOnly,
                  friendsOnly,
                  () => setFriendsOnly((v) => !v),
                ],
              ] as const
            ).map(([label, active, toggle]) => (
              <button
                key={label}
                onClick={toggle}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium ${
                  active
                    ? "bg-hero-deep text-white"
                    : "border-[1.5px] border-ink-16 text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4 pt-5">
          {resolved.map(({ stop, place }, i) => (
            <div
              key={stop.key}
              className={`flex items-center gap-3 rounded-card bg-canvas-soft p-[13px_14px] ${
                draggingKey === stop.key ? "opacity-70 shadow-card" : ""
              }`}
            >
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${i === 0 ? "bg-pop" : "bg-hero-deep"}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{place.title}</span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  {stop.time} · {categoryFor(place.tags)}
                </span>
              </span>
              <button
                onClick={() => setStops((prev) => prev.filter((s) => s.key !== stop.key))}
                aria-label={`Remove ${place.title}`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
              >
                <X size={14} strokeWidth={2.25} className="text-muted" aria-hidden />
              </button>
              {/* The handle. touch-none stops the browser claiming the gesture as a scroll. */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Reorder ${place.title}`}
                onPointerDown={(e) => onPointerDown(e, i, stop.key)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="flex shrink-0 cursor-grab touch-none flex-col gap-[3px] px-1.5 py-2"
              >
                <span className="block h-0.5 w-4 bg-ink-16" />
                <span className="block h-0.5 w-4 bg-ink-16" />
                <span className="block h-0.5 w-4 bg-ink-16" />
              </span>
            </div>
          ))}

          <button
            onClick={() => setPicking(true)}
            className="flex items-center gap-3 rounded-card border-[1.5px] border-dashed border-ink-16 p-[17px_14px] text-left"
          >
            <span className="text-[18px] font-medium text-pop">+</span>
            <span className="text-[14px] font-medium text-muted">
              {COPY.ricochets.addStop}
            </span>
          </button>

          {resolved.length > 1 && (
            <div className="mt-2 flex items-center gap-3 rounded-card bg-canvas px-4 py-3.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-hero-deep" />
              <span className="text-[13px] leading-[1.4] text-ink-60">
                {COPY.ricochets.walkable(resolved.length, km.toFixed(1))}
              </span>
            </div>
          )}
        </div>
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[rgba(23,0,82,0.55)]">
          <button
            aria-label="Close"
            className="flex-1"
            onClick={() => setPicking(false)}
          />
          <div className="max-h-[70vh] rounded-t-[28px] bg-surface px-5 pb-safe pt-3">
            <span className="mx-auto mb-4 block h-1 w-[42px] rounded-full bg-ink-16" />
            <div className="flex h-[42px] items-center gap-2.5 rounded-full bg-canvas px-3.5">
              <Search size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your city"
                aria-label="Search your city"
                className="min-w-0 flex-1 bg-transparent text-[16px] leading-none outline-none placeholder:text-muted"
              />
            </div>
            <div className="mt-2 max-h-[46vh] overflow-y-auto">
              {candidates.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addStop(p)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span
                    className="photo h-10 w-10 shrink-0 rounded-tile"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{p.title}</span>
                    <span className="block text-[12px] text-ink-50">{p.area}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <TabBar />
    </main>
  );
}
