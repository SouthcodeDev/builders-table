"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  CITIES,
  MARKER_ICONS,
  PLACES,
  categoryFor,
  type City,
  type Place,
} from "@/data/seed";

// Search over the seed, never over a places API (AGENTS.md §1.9). Everything
// matchable is already in the repo, so this is a filter, not a lookup.

const MAX_PLACE_RESULTS = 5;

type Props = {
  city: City;
  onPickCity: (city: City) => void;
  onPickPlace: (placeId: string) => void;
  /** Sits over the map, so it needs the opaque treatment there. */
  onSurface?: boolean;
};

export function PlaceSearch({ city, onPickCity, onPickPlace, onSurface = false }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const { cities, places } = useMemo(() => {
    if (q.length === 0) return { cities: [] as City[], places: [] as Place[] };
    return {
      // The other city only ever surfaces by name — this is the Tokyo door.
      cities: (Object.keys(CITIES) as City[]).filter(
        (id) => id !== city && CITIES[id].label.toLowerCase().includes(q),
      ),
      places: PLACES.filter(
        (p) =>
          p.city === city &&
          (p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
      ).slice(0, MAX_PLACE_RESULTS),
    };
  }, [q, city]);

  const hasResults = cities.length > 0 || places.length > 0;

  return (
    <div className="relative">
      <div
        className={`flex h-[42px] items-center gap-2.5 rounded-full px-3.5 ${
          onSurface ? "bg-white/95 shadow-[0_2px_8px_rgba(10,10,10,0.1)]" : "bg-canvas"
        }`}
      >
        <Search size={16} strokeWidth={2} className="shrink-0 text-muted" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city or a place"
          aria-label="Search a city or a place"
          // iOS zooms the viewport on focus for anything under 16px. The PWA is
          // locked to 390px and never recovers from that zoom.
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-none outline-none placeholder:text-muted"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-08"
          >
            <X size={13} strokeWidth={2.5} className="text-muted" aria-hidden />
          </button>
        )}
      </div>

      {q.length > 0 && (
        <div className="absolute inset-x-0 top-[50px] z-30 overflow-hidden rounded-big bg-surface shadow-[0_18px_40px_-18px_rgba(42,0,133,0.45),0_2px_6px_rgba(10,10,10,0.06)]">
          {!hasResults ? (
            <p className="px-4 py-3.5 text-[13px] text-ink-50">
              Nothing here by that name.
            </p>
          ) : (
            <>
              {cities.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setQuery("");
                    onPickCity(id);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-hero text-[13px] font-medium text-white">
                    {CITIES[id].label.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{CITIES[id].label}</span>
                    <span className="block text-[12px] text-ink-50">
                      Switch city · {CITIES[id].tz.split("/")[1].replace("_", " ")}
                    </span>
                  </span>
                </button>
              ))}
              {places.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setQuery("");
                    onPickPlace(p.id);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-canvas text-ink-60">
                    {/* Same generated lucide art the map markers use. */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      dangerouslySetInnerHTML={{ __html: MARKER_ICONS[categoryFor(p.tags)] }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{p.title}</span>
                    <span className="block text-[12px] text-ink-50">{p.area}</span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
