"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import MapView from "@/components/map-view";
import { CITIES, placesIn, type City } from "@/data/seed";

export default function MapSpike() {
  const [city, setCity] = useState<City>("cape-town");
  return (
    <main className="flex flex-1 flex-col gap-4 bg-canvas px-4 pt-safe pb-safe">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-60">
          Gate 5 · mapbox spike
        </p>
        <div className="flex gap-2">
          {(Object.keys(CITIES) as City[]).map((c) => (
            <Button key={c} size="sm" onPress={() => setCity(c)}>
              {CITIES[c].label}
            </Button>
          ))}
        </div>
      </div>
      <MapView city={city} height={420} />
      <p className="text-xs text-ink-60">
        {placesIn(city).length} seeded pins · centre {CITIES[city].label}
      </p>
    </main>
  );
}
