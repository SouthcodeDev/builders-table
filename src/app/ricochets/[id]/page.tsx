"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, Share2 } from "lucide-react";
import {
  COPY,
  directionsUrl,
  distanceKm,
  placeById,
  type Place,
} from "@/data/seed";
import MapView from "@/components/map-view";
import { TabBar } from "@/components/tab-bar";
import { usePlaces } from "@/state/places";

export default function RicochetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { ready, ricochets, takeRicochet } = usePlaces();
  const [taken, setTaken] = useState(false);

  const ricochet = ricochets.find((r) => r.id === params.id);

  // End to end, measured off the real coordinates. Never a typed-in number (§1.5).
  const { stops, km } = useMemo(() => {
    const resolved = (ricochet?.stops ?? [])
      .map((stop) => ({ stop, place: placeById(stop.placeId) }))
      .filter((x): x is { stop: typeof x.stop; place: Place } => Boolean(x.place));
    let total = 0;
    for (let i = 1; i < resolved.length; i++) {
      total += distanceKm(resolved[i - 1].place, resolved[i].place);
    }
    return { stops: resolved, km: total };
  }, [ricochet]);

  if (!ready) return <main className="min-h-dvh flex-1 bg-surface" />;

  if (!ricochet) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-canvas px-6 text-center text-sm text-ink-50">
        That ricochet is gone.
      </main>
    );
  }

  const kmLabel = km.toFixed(1);
  const last = stops[stops.length - 1]?.place;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[84px]">
        <div
          className="photo relative h-[240px] shrink-0"
          style={{ backgroundImage: `url(${ricochet.image})` }}
        >
          <span className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,14,0.88)] to-[rgba(8,7,14,0.1)]" />
          <button
            onClick={() => router.back()}
            aria-label="Back"
            style={{ top: "max(env(safe-area-inset-top), 54px)" }}
            className="absolute left-5 grid h-[34px] w-[34px] place-items-center rounded-full bg-white/22 backdrop-blur-sm"
          >
            <ChevronLeft size={18} strokeWidth={2.25} className="text-white" aria-hidden />
          </button>
          <div className="absolute inset-x-5 bottom-[18px] text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/80">
              Ricochet · {ricochet.stops.length} stops
            </p>
            <h1 className="mt-1.5 text-[28px] font-medium leading-[1.05] tracking-[-0.02em]">
              {ricochet.title}
            </h1>
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-white bg-hero-deep text-[8px] font-medium text-white">
                {ricochet.authorInitials}
              </span>
              <span className="text-[12px] text-white/88">
                {COPY.ricochets.chainedBy(ricochet.authorName, ricochet.savedCount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col px-5 pb-5 pt-[22px]">
          {stops.map(({ stop, place }, i) => {
            const isLast = i === stops.length - 1;
            return (
              <div key={stop.placeId} className="flex gap-3.5">
                <div className="flex w-7 shrink-0 flex-col items-center">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-medium text-white ${
                      i === 0 ? "bg-pop" : "bg-hero-deep"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {!isLast && (
                    <span
                      className="my-1 w-0.5 flex-1"
                      style={{
                        background:
                          "repeating-linear-gradient(to bottom, rgba(42,0,133,0.35) 0 4px, transparent 4px 8px)",
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => router.push(`/place/${place.id}`)}
                  className={`min-w-0 flex-1 text-left ${isLast ? "" : "pb-[18px]"}`}
                >
                  <span className="block text-[11px] font-medium tracking-[0.08em] text-muted">
                    {stop.time} · {stop.travel ? stop.travel.toUpperCase() : "START"}
                  </span>
                  <span className="mt-1.5 flex gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium tracking-[-0.01em]">
                        {place.title}
                      </span>
                      <span className="mt-[3px] block text-[12px] leading-[1.4] text-muted">
                        {stop.note}
                      </span>
                    </span>
                    <span
                      className="photo h-[62px] w-[62px] shrink-0 rounded-tile"
                      style={{ backgroundImage: `url(${place.image})` }}
                    />
                  </span>
                </button>
              </div>
            );
          })}

          <div className="relative mt-5 h-[180px] overflow-hidden rounded-card">
            <MapView city={ricochet.city} places={stops.map((s) => s.place)} height={180} />
            <div className="pointer-events-none absolute inset-x-3.5 bottom-3.5 flex items-center justify-between rounded-tile bg-white/94 px-3.5 py-2.5">
              <span className="text-[13px] font-medium">
                {COPY.ricochets.endToEnd(kmLabel)}
              </span>
              {last && (
                <a
                  href={directionsUrl(last)}
                  className="pointer-events-auto text-[12px] font-medium text-hero-deep"
                >
                  {COPY.ricochets.openMaps}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed directly above the tab bar — the same idiom the map's pin sheet uses.
          In flow it lands underneath the fixed nav and disappears. */}
      <div className="bottom-tabbar fixed inset-x-0 z-40 flex gap-2.5 border-t border-ink-07 bg-surface px-5 pb-3 pt-3.5">
        <button
          onClick={() => {
            takeRicochet(ricochet.id);
            setTaken(true);
          }}
          className="button h-[54px] flex-1 bg-pop text-[16px] font-medium text-white"
        >
          {taken ? COPY.ricochets.taken : COPY.ricochets.take}
        </button>
        <button
          onClick={() => {
            void navigator
              .share?.({ title: ricochet.title, url: window.location.href })
              .catch(() => {});
          }}
          aria-label="Share this ricochet"
          className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border-[1.5px] border-ink-16"
        >
          <Share2 size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>
      <TabBar />
    </main>
  );
}
