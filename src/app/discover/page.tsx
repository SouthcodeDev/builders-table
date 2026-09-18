"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
  CITIES,
  COPY,
  INTEREST_CHIPS,
  placeById,
  STORAGE,
  daypart,
  formatLocal,
  weekday,
} from "@/data/seed";
import { EventCard } from "@/components/event-card";
import { LogoMark } from "@/components/logo-mark";
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

  const tokyoClock = city === "tokyo"
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date())
    : "";

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      {city === "tokyo" ? (
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-safe">
          <div className="pt-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-canvas px-3.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-hero" />
              <span className="text-xs font-medium tracking-[0.04em]">
                {COPY.tokyo.chip(`${tokyoClock} JST`)}
              </span>
            </span>
          </div>
          <div className="pt-3.5">
            <p className="kicker">
              {weekday(cityMeta.tz)} {daypart(cityMeta.tz)} · {cityMeta.label}
            </p>
            <h1 className="mt-1.5 text-2xl font-medium leading-[1.12] tracking-[-0.02em]">
              {COPY.tokyo.title}
            </h1>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto pb-4 pt-4">
            {events.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
                <p className="text-[19px] font-medium tracking-[-0.015em]">
                  {COPY.discover.emptyTitle}
                </p>
                <p className="max-w-[260px] text-sm leading-[1.5] text-ink-50">
                  {COPY.discover.emptySub}
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
                  timePill={i === 0 ? `${formatLocal(p)} JST` : undefined}
                  subline={i === 0 ? p.blurb : undefined}
                  onPress={() => router.push(`/place/${p.id}`)}
                />
              ))
            )}
            <div className="flex items-center gap-3 rounded-big bg-canvas-soft p-4">
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-hero">
                <LogoMark size={16} color="#FFFFFF" />
              </span>
              <span className="text-[13px] leading-[1.4] text-ink-60">{COPY.tokyo.note}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col pt-safe gap-4">
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
              <MapPin size={17} strokeWidth={2} className="text-hero" aria-hidden />
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
                  className="flex w-full items-center gap-3.5 rounded-big bg-pop p-[16px_18px] text-left shadow-pop"
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
                    <LogoMark size={20} />
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
                <MapView
                  city={city}
                  places={events}
                  selectedId={pinId}
                  onSelectPin={setPinId}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-big bg-white/95 p-4 shadow-sheet">
                  <p className="text-[10px] font-medium tracking-[0.08em] text-muted">
                    {COPY.discover.pinHint}
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium">
                    {COPY.discover.pinSummary(n, radiusKm)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* pin sheet */}
      {pinPlace && tab === "map" && (
        <div className="bottom-tabbar fixed inset-x-0 z-40 px-4">
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
