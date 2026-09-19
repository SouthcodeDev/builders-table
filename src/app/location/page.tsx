"use client";

import { useRouter } from "next/navigation";
import { Check, LocateFixed, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CITIES, COPY, areasIn, placesIn, type City } from "@/data/seed";
import { distanceKm } from "@/data/geo";
import { usePlaces } from "@/state/places";

const COUNTRY_OF: Record<City, string> = {
  "cape-town": "South Africa",
  tokyo: "Japan",
};

export default function LocationPage() {
  const router = useRouter();
  const { city, area, radiusKm, setArea, setRadiusKm, setCity } = usePlaces();
  const [query, setQuery] = useState("");
  const [pickedCity, setPickedCity] = useState<City>(city);
  const [picked, setPicked] = useState<string | null>(area);
  const [pickedRadius, setPickedRadius] = useState<number | null>(radiusKm);
  const [locating, setLocating] = useState(false);

  const pickCity = (c: City) => {
    if (c === pickedCity) return;
    // Areas don't carry across cities — drop the area pick, keep the radius.
    setPickedCity(c);
    setPicked(null);
  };

  const areas = useMemo(() => {
    const center = CITIES[pickedCity].center;
    // Tokyo has no curated rows yet — fall back to the city's fixed area list so
    // the selector still shows what will be there once curation lands.
    const names =
      areasIn(pickedCity).length > 0 ? areasIn(pickedCity) : CITIES[pickedCity].areas;
    return names
      .filter((a) => a.toLowerCase().includes(query.toLowerCase()))
      .map((a) => {
        const inArea = placesIn(pickedCity).filter((p) => p.area === a);
        const nearest = Math.min(...inArea.map((p) => distanceKm(center, p)), 999);
        return { area: a, count: inArea.length, km: Math.round(nearest * 10) / 10 };
      });
  }, [pickedCity, query]);

  const useMyLocation = () => {
    if (locating || typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const nearest = placesIn(pickedCity)
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
    if (pickedCity !== city) setCity(pickedCity);
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
          <X size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      {/* Country / city — Tokyo is the only other city in the demo */}
      <p className="kicker mt-5">{COPY.location.cityHeading}</p>
      <div className="mt-2.5 flex flex-col gap-2">
        {(Object.keys(CITIES) as City[]).map((c) => {
          const isPicked = pickedCity === c;
          return (
            <button
              key={c}
              onClick={() => pickCity(c)}
              className="flex items-center gap-3 rounded-tile bg-canvas-soft px-4 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] ${isPicked ? "font-medium" : ""}`}>
                  {CITIES[c].label}
                </span>
                <span className="block text-xs text-muted">{COUNTRY_OF[c]}</span>
              </span>
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                  isPicked ? "bg-hero" : "border border-ink-16"
                }`}
              >
                {isPicked && <Check size={13} strokeWidth={3} className="text-white" aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-4">
        <Search
          size={16}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={COPY.location.searchPlaceholder}
          className="flex h-12 w-full items-center rounded-tile bg-canvas-soft pl-10 pr-3.5 text-[15px] outline-none placeholder:text-ink-42"
        />
      </div>

      <button
        onClick={useMyLocation}
        className="mt-3.5 flex items-center gap-3 rounded-2xl bg-hero p-4 text-left shadow-hero"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/18">
          <LocateFixed size={16} strokeWidth={2} className="text-white" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-white">
            {locating ? "Finding you…" : COPY.location.useMyLocation}
          </span>
          <span className="mt-0.5 block text-xs text-white/80">
            {CITIES[pickedCity].label}
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
                {isPicked && <Check size={13} strokeWidth={3} className="text-white" aria-hidden />}
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
        className="button mt-auto flex h-[54px] w-full items-center justify-center bg-pop text-base font-medium text-white shadow-pop"
      >
        {COPY.location.cta(picked ?? CITIES[pickedCity].label, pickedRadius)}
      </button>
    </main>
  );
}
