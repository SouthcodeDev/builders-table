"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { COPY, INTEREST_CHIPS } from "@/data/seed";
import { usePlaces } from "@/state/places";

export default function PersonaPage() {
  const router = useRouter();
  const { ready, mode, interests, personaLoading, persona, requestPersona } = usePlaces();

  useEffect(() => {
    if (ready && mode && !persona && !personaLoading) {
      void requestPersona();
    }
  }, [ready, mode, persona, personaLoading, requestPersona]);

  if (personaLoading || !persona) {
    const labels = INTEREST_CHIPS.filter((c) => interests.includes(c.tag)).map((c) =>
      c.label.toLowerCase(),
    );
    return (
      <main className="flex min-h-dvh flex-1 flex-col bg-hero px-7 pt-safe pb-safe text-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-[26px] text-center">
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

  const labels = INTEREST_CHIPS.filter((c) => interests.includes(c.tag)).map((c) => c.label);

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-pop px-6 pt-safe pb-safe">
      <span className="absolute -right-[170px] top-[470px] h-[300px] w-[300px] rounded-full bg-hero" />
      <span className="absolute -left-[150px] bottom-[84px] h-40 w-40 rounded-full bg-surface" />
      <div className="relative z-10 flex flex-1 flex-col justify-center gap-[22px]">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/80">
          {COPY.persona.kicker(labels)}
        </p>
        <h1 className="text-[38px] font-medium leading-[1.04] tracking-[-0.03em] text-white [text-wrap:pretty]">
          {persona.label}
        </h1>
        <p className="max-w-[290px] text-[17px] leading-[1.45] text-white/90">
          {persona.sentence}
        </p>
        <p className="max-w-[290px] text-[13px] leading-[1.5] text-white/78">
          {COPY.persona.subcopy}
        </p>
      </div>
      <button
        onClick={() => {
          // The one geolocation prompt, during onboarding (SETUP.md Step 5).
          // Fire and forget — the answer lands whenever the user gets to it.
          if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(() => {}, () => {});
          }
          router.push("/discover");
        }}
        className="button relative z-10 flex h-[54px] w-full items-center justify-center bg-surface text-base font-medium text-ink"
      >
        {COPY.persona.accept}
      </button>
    </main>
  );
}
