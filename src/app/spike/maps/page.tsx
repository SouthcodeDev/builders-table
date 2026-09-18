"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { COPY, placeById } from "@/data/seed";
import { directionsUrl } from "@/data/geo";

export default function MapsSpike() {
  const place = placeById("ct-woodstock-open-studio");
  if (!place) return <main className="pt-safe pb-safe">No seed place found.</main>;
  const url = directionsUrl(place);
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-canvas px-6 pt-safe pb-safe text-center">
      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-60">
        Gate 4 · handoff spike
      </p>
      <h1 className="font-body text-xl">{place.title}</h1>
      <Button size="lg" onPress={() => window.open(url, "_blank")}>
        {COPY.event.directions}
      </Button>
      <p className="max-w-[320px] break-all text-xs text-ink-60">{url}</p>
      <Link href="/" className="text-sm text-ink-60 underline">
        ← back
      </Link>
    </main>
  );
}
