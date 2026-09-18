"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { COPY } from "@/data/seed";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-canvas px-6 pt-safe pb-safe text-center">
      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-60">
        Skeleton · Gate 1
      </p>
      <h1 className="font-wordmark text-5xl font-black text-hero">
        {COPY.splash.wordmark}
      </h1>
      <Button size="lg">{COPY.splash.cta}</Button>
      <nav className="flex flex-col gap-2 text-sm text-ink-60">
        <Link href="/spike/maps">/spike/maps — Gate 4 handoff</Link>
        <Link href="/spike/map">/spike/map — Gate 5 mapbox</Link>
        <Link href="/spike/seed">/spike/seed — Gate 6 seed times</Link>
      </nav>
    </main>
  );
}
