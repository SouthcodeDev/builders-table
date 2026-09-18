"use client";

import { CITIES, PLACES } from "@/data/seed";
import { formatDayLabel, formatLocal, isStartingSoon, minutesUntil } from "@/data/schedule";
import { distanceKm, formatDistance } from "@/data/geo";

export default function SeedSpike() {
  return (
    <main className="mx-auto flex w-full max-w-[390px] flex-1 flex-col gap-8 bg-canvas px-5 pt-safe pb-safe">
      <header className="pt-6">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-60">
          Gate 6 · seed check
        </p>
        <h1 className="text-xl">{PLACES.length} places · times computed from now</h1>
      </header>
      {(Object.keys(CITIES) as (keyof typeof CITIES)[]).map((city) => (
        <section key={city} className="flex flex-col gap-3">
          <h2 className="text-sm uppercase tracking-[0.1em] text-ink-60">
            {CITIES[city].label} · {CITIES[city].tz}
          </h2>
          <ul className="flex flex-col gap-3">
            {PLACES.filter((p) => p.city === city).map((p) => (
              <li key={p.id} className="rounded-card bg-surface p-4 shadow-sm">
                <p className="text-[15px]">{p.title}</p>
                <p className="mt-1 text-xs text-ink-60">
                  {formatDayLabel(p)} {formatLocal(p)} ·{" "}
                  {CITIES[p.city].tz.split("/")[1]} · {formatDistance(distanceKm(CITIES[p.city].center, p))} from centre ·{" "}
                  {p.price ?? "—"} · in {minutesUntil(p)} min
                </p>
                {isStartingSoon(p) && (
                  <p className="mt-2 inline-block rounded-full bg-hero px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                    Starting soon
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
