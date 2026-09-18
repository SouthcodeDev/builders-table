"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { COPY, INTEREST_CHIPS } from "@/data/seed";
import { usePlaces } from "@/state/places";

const DOTS = ["bg-hero", "bg-accent", "bg-teal"];

export default function PersonaPage() {
  const router = useRouter();
  const { ready, mode, interests, personaLoading, persona, requestPersona } = usePlaces();

  useEffect(() => {
    if (ready && mode === "judge" && !persona && !personaLoading) {
      void requestPersona();
    }
  }, [ready, mode, persona, personaLoading, requestPersona]);

  if (personaLoading || !persona) {
    const labels = INTEREST_CHIPS.filter((c) => interests.includes(c.tag)).map((c) =>
      c.label.toLowerCase(),
    );
    return (
      <main className="flex min-h-dvh flex-1 flex-col bg-[#170052] px-7 pt-safe pb-safe text-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="h-24 w-24 animate-spin rounded-full border-[2.5px] border-hero-soft/35 border-t-hero-soft" />
          <p className="max-w-[260px] text-2xl font-medium leading-[1.2] tracking-[-0.02em]">
            {labels.length > 0 ? (
              <>
                {labels.slice(0, 3).join(", ")}. <br />
                {COPY.personaLoading.building}
              </>
            ) : (
              COPY.personaLoading.building
            )}
          </p>
          <p className="max-w-[240px] text-sm leading-[1.5] text-white/55">
            {COPY.personaLoading.sub}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface px-6 pt-safe pb-safe">
      <div className="flex flex-1 flex-col justify-center gap-[22px]">
        <p className="kicker">{COPY.persona.kicker}</p>
        <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em]">
          {persona.sentence}
        </h1>
        <div className="flex flex-col gap-2.5">
          {persona.ranked.slice(0, 3).map((r, i) => (
            <div
              key={r.eventId}
              className="flex items-center gap-2.5 rounded-tile bg-canvas-soft px-4 py-3.5"
            >
              <span className={`h-2 w-2 rounded-full ${DOTS[i % DOTS.length]}`} />
              <span className="text-[15px]">{r.reason}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] leading-[1.5] text-ink-42">{COPY.persona.footnote}</p>
      </div>
      <button
        onClick={() => router.push("/discover")}
        className="button flex h-[54px] items-center justify-center bg-hero-deep text-base font-medium text-white shadow-[0_12px_24px_-14px_rgba(42,0,133,0.7)]"
      >
        {COPY.persona.accept}
      </button>
    </main>
  );
}
