"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CITIES, COPY, areasIn, placesIn } from "@/data/seed";
import { distanceKm } from "@/data/geo";
import { usePlaces } from "@/state/places";

export default function LocationPage() {
  const router = useRouter();
  const { city, area, radiusKm, setArea, setRadiusKm } = usePlaces();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(area);
  const [pickedRadius, setPickedRadius] = useState<number | null>(radiusKm);
  const [locating, setLocating] = useState(false);

  const areas = useMemo(() => {
    const center = CITIES[city].center;
    return areasIn(city)
      .filter((a) => a.toLowerCase().includes(query.toLowerCase()))
      .map((a) => {
        const inArea = placesIn(city).filter((p) => p.area === a);
        const nearest = Math.min(...inArea.map((p) => distanceKm(center, p)), 999);
        return { area: a, count: inArea.length, km: Math.round(nearest * 10) / 10 };
      });
  }, [city, query]);

  const useMyLocation = () => {
    if (locating || typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = placesIn(city)
          .map((p) => ({ area: p.area, km: distanceKm(here, p) }))
          .sort((a, b) => a.km - b.km)[0];
        if (nearest) setPicked(nearest.area);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 6000 },
    );
  };

  const apply = () => {
    setArea(picked);
    setRadiusKm(pickedRadius);
    router.push("/discover");
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface px-5 pt-safe pb-safe">
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="text-[26px] font-medium tracking-[-0.02em]">{COPY.location.title}</h1>
        <button
          onClick={() => router.back()}
          aria-label={COPY.deck.close}
          className="grid h-[34px] w-[34px] place-items-center rounded-full bg-canvas-soft"
        >
          <span className="relative block h-3 w-3">
            <span className="absolute inset-x-0 top-[5px] rotate-45 border-t-2 border-ink" />
            <span className="absolute inset-x-0 top-[5px] -rotate-45 border-t-2 border-ink" />
          </span>
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={COPY.location.searchPlaceholder}
        className="mt-4 flex h-12 items-center rounded-tile bg-canvas-soft px-3.5 text-[15px] outline-none placeholder:text-ink-42"
      />

      <button
        onClick={useMyLocation}
        className="mt-3.5 flex items-center gap-3 rounded-2xl bg-hero p-4 text-left shadow-hero"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/18">
          <span className="h-3 w-3 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-white">
            {locating ? "Finding you…" : COPY.location.useMyLocation}
          </span>
          <span className="mt-0.5 block text-xs text-white/80">
            {CITIES[city].label}
          </span>
        </span>
      </button>

      <p className="kicker mt-[22px]">{COPY.location.nearbyHeading}</p>
      <div className="mt-2.5 flex flex-col gap-2">
        {areas.map(({ area: a, count, km }) => {
          const isPicked = picked === a;
          return (
            <button
              key={a}
              onClick={() => setPicked(a)}
              className="flex items-center gap-3 rounded-tile bg-canvas-soft px-4 py-3.5 text-left"
            >
              <span className={`min-w-0 flex-1 text-[15px] ${isPicked ? "font-medium" : ""}`}>
                {a}
              </span>
              <span className="text-xs text-muted">{COPY.location.areaMeta(count, km)}</span>
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                  isPicked ? "bg-hero" : "border border-ink-16"
                }`}
              >
                {isPicked && (
                  <span className="h-[7px] w-[4px] -translate-y-px -rotate-45 border-x-2 border-b-2 border-white" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="kicker mt-[22px]">{COPY.location.radiusHeading}</p>
      <div className="mt-3 flex gap-2">
        {COPY.location.radiusOptions.map((o) => {
          const isOn = pickedRadius === o.km;
          return (
            <button
              key={o.label}
              onClick={() => setPickedRadius(o.km)}
              className={`flex-1 rounded-full py-2.5 text-[13px] font-medium ${
                isOn ? "bg-ink text-white" : "bg-canvas text-muted"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={apply}
        className="button mt-auto flex h-[54px] items-center justify-center bg-hero text-base font-medium text-white shadow-hero"
      >
        {COPY.location.cta(picked ?? CITIES[city].label, pickedRadius)}
      </button>
    </main>
  );
}
