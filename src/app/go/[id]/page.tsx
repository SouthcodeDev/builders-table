"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navigation } from "lucide-react";
import { COPY, directionsUrl, minutesUntil, placeById } from "@/data/seed";

export default function GoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const place = placeById(params.id);

  useEffect(() => {
    if (!place) return;
    const key = `places.handedOff.${place.id}`;
    // Returning from Maps cold-reloads into this route — never re-fire the handoff.
    if (sessionStorage.getItem(key)) {
      router.replace("/discover");
      return;
    }
    sessionStorage.setItem(key, "1");
    const url = directionsUrl(place);
    const t = setTimeout(() => {
      window.location.href = url;
    }, 1200);
    return () => clearTimeout(t);
  }, [place, router]);

  if (!place) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-canvas px-6 text-center text-sm text-ink-50">
        That one is gone.
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-hero px-7 pt-safe pb-safe text-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-[22px] text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/16">
          <Navigation size={26} strokeWidth={2} className="text-white" aria-hidden />
        </span>
        <h1 className="text-[30px] font-medium leading-[1.15] tracking-[-0.02em]">
          {COPY.handoff.title(minutesUntil(place))}
        </h1>
        <p className="max-w-[250px] text-[15px] leading-[1.5] text-white/75">
          {COPY.handoff.sub}
        </p>
      </div>
    </main>
  );
}
