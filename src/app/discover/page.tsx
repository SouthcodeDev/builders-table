"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CITIES,
  COPY,
  INTEREST_CHIPS,
  placeById,
  STORAGE,
} from "@/data/seed";
import { daypart, weekday } from "@/data/schedule";
import { EventCard } from "@/components/event-card";
import MapView from "@/components/map-view";
import { PinSheet } from "@/components/pin-sheet";
import { Segmented } from "@/components/segmented";
import { TabBar } from "@/components/tab-bar";
import { usePlaces } from "@/state/places";

type Tab = "feed" | "map";

export default function DiscoverPage() {
  const router = useRouter();
  const {
    ready, mode, user, interests, city, area, radiusKm, events,
    attendanceFor, distanceTo, addPlan,
  } = usePlaces();
  const [tab, setTab] = useState<Tab>("feed");
  const [pinId, setPinId] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem(STORAGE.tab);
      if (stored === "feed" || stored === "map") setTab(stored);
    });
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    localStorage.setItem(STORAGE.tab, t);
  };

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  const cityMeta = CITIES[city];
  const n = events.length;
  const firstName = user?.name.split(" ")[0] ?? "there";
  const topTwo = INTEREST_CHIPS.filter((c) => interests.includes(c.tag))
    .slice(0, 2)
    .map((c) => c.label.toLowerCase());

  const pinPlace = pinId ? placeById(pinId) : null;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="flex flex-1 flex-col pt-safe">
        {/* header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-[18px]">
          <div className="min-w-0">
            <p className="kicker">
              {weekday(cityMeta.tz)} {daypart(cityMeta.tz)} · {cityMeta.label}
              {area ? ` · ${area}` : ""}
            </p>
            <h1 className="mt-1.5 text-2xl font-medium leading-[1.12] tracking-[-0.02em]">
              {mode === "active" ? (
                <>
                  Evening, {firstName}.
                  <br />
                  {n} things on nearby.
                </>
              ) : topTwo.length >= 2 ? (
                <>
                  Into {topTwo.join(" and ")}?
                  <br />
                  {n} things nearby.
                </>
              ) : (
                <>
                  {n} things nearby,
                  <br />
                  picked for tonight.
                </>
              )}
            </h1>
          </div>
          <button
            onClick={() => router.push("/location")}
            aria-label={COPY.location.title}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] border-ink-16 bg-surface shadow-[0_1px_2px_rgba(10,10,10,0.05)]"
          >
            <span className="h-[13px] w-[13px] rotate-[-45deg] rounded-[50%_50%_50%_0] bg-hero" />
          </button>
        </div>

        {/* feed / map */}
        <div className="px-4 pt-4">
          <Segmented
            options={[
              { id: "feed" as Tab, label: COPY.discover.feedTab },
              { id: "map" as Tab, label: COPY.discover.mapTab },
            ]}
            value={tab}
            onChange={switchTab}
          />
        </div>

        {tab === "feed" ? (
          <>
            <div className="px-4 pt-3.5">
              <button
                onClick={() => router.push("/deck")}
                className="flex w-full items-center gap-3.5 rounded-big bg-hero p-[16px_18px] text-left shadow-hero"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-medium tracking-[-0.015em] text-white">
                    {COPY.discover.findForMe}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-white/80">
                    {COPY.discover.findForMeSub}
                  </span>
                </span>
                <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-surface">
                  <span className="h-[13px] w-[13px] rotate-[-45deg] rounded-[50%_50%_50%_0] bg-hero" />
                </span>
              </button>
            </div>
            <div className="flex items-baseline justify-between px-4 pt-[18px]">
              <h2 className="text-[17px] font-medium tracking-[-0.015em]">
                {COPY.discover.nearbyHeading}
              </h2>
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted">
                {COPY.discover.radiusLabel(radiusKm)}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-4 pt-3">
              {n === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-[19px] font-medium tracking-[-0.015em]">
                    {COPY.discover.emptyTitle}
                  </p>
                  <p className="max-w-[260px] text-sm leading-[1.5] text-ink-50">
                    {COPY.discover.emptySub}
                  </p>
                  <p className="max-w-[260px] text-[13px] text-ink-42">
                    {COPY.discover.emptyFootnote}
                  </p>
                </div>
              ) : (
                events.map((p, i) => (
                  <EventCard
                    key={p.id}
                    place={p}
                    distanceKm={distanceTo(p)}
                    attendance={attendanceFor(p.id)}
                    variant={i === 0 ? "featured" : "compact"}
                    onPress={() => router.push(`/place/${p.id}`)}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-big">
              <MapView city={city} onSelectPin={setPinId} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-big bg-white/95 p-4 shadow-sheet">
                <p className="text-[10px] font-medium tracking-[0.08em] text-muted">
                  {COPY.discover.pinHint}
                </p>
                <p className="mt-0.5 text-[15px] font-medium">{COPY.discover.pinSummary(n)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* pin sheet */}
      {pinPlace && tab === "map" && (
        <div className="fixed inset-x-0 bottom-[76px] z-40 px-4">
          <PinSheet
            place={pinPlace}
            distanceKm={distanceTo(pinPlace)}
            attendance={attendanceFor(pinPlace.id)}
            onGoing={() => {
              addPlan(pinPlace.id, "going");
              setPinId(null);
              router.push("/plans");
            }}
            onDirections={() => router.push(`/go/${pinPlace.id}`)}
          />
        </div>
      )}

      <TabBar />
    </main>
  );
}