"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COPY, INTEREST_CHIPS, type Tag } from "@/data/seed";
import { InterestTile } from "@/components/interest-tile";
import { usePlaces } from "@/state/places";

export default function InterestsPage() {
  const router = useRouter();
  const { interests, setInterests, requestPersona } = usePlaces();
  const [sending, setSending] = useState(false);

  const toggle = (tag: Tag) =>
    setInterests(
      interests.includes(tag) ? interests.filter((t) => t !== tag) : [...interests, tag],
    );

  const canCarryOn = interests.length >= 3;

  const carryOn = () => {
    if (!canCarryOn || sending) return;
    setSending(true);
    void requestPersona();
    router.push("/persona");
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface px-5 pt-safe pb-safe">
      <div className="mt-5 flex items-center gap-3">
        <div className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-track">
          <div className="h-full w-1/2 bg-hero-deep" />
        </div>
        <span className="text-xs text-muted">{COPY.interests.step}</span>
        <button
          onClick={() => router.push("/discover")}
          className="text-[13px] font-medium text-hero"
        >
          {COPY.interests.skip}
        </button>
      </div>
      <div className="mt-5">
        <h1 className="text-[26px] font-medium leading-[1.1] tracking-[-0.02em]">
          {COPY.interests.title}
        </h1>
        <p className="mt-1.5 text-sm text-ink-50">{COPY.interests.sub}</p>
      </div>
      <div className="mt-[18px] grid grid-cols-3 gap-2.5">
        {INTEREST_CHIPS.map((c) => (
          <InterestTile
            key={c.tag}
            tag={c.tag}
            selected={interests.includes(c.tag)}
            onToggle={() => toggle(c.tag)}
          />
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <button
          onClick={carryOn}
          disabled={!canCarryOn || sending}
          className="button flex h-[54px] items-center justify-center bg-hero-deep text-base font-medium text-white shadow-[0_12px_24px_-14px_rgba(42,0,133,0.7)] disabled:opacity-90"
        >
          {canCarryOn ? COPY.interests.ctaReady : COPY.interests.ctaLocked}
        </button>
        <div className="home-indicator mx-auto" />
      </div>
    </main>
  );
}
