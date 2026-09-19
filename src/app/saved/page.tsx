"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import { COPY, personById, placeById } from "@/data/seed";
import { PlanRow } from "@/components/plan-row";
import { usePlaces } from "@/state/places";

export default function SavedPage() {
  const router = useRouter();
  const { ready, plans } = usePlaces();

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-surface" />;
  }

  const saved = plans
    .filter((p) => p.status === "saved")
    .sort((a, b) => b.createdAtMs - a.createdAtMs);

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface pt-safe pb-safe">
      <div className="flex items-center gap-3 px-5 pt-[20px]">
        <button
          onClick={() =>
            router.push("/plans")
          }
          aria-label="Back"
          className="-ml-2 grid h-9 w-9 place-items-center rounded-full"
        >
          <ArrowLeft size={20} strokeWidth={2.25} aria-hidden />
        </button>
        <h1 className="text-[26px] font-medium tracking-[-0.02em]">{COPY.saved.title}</h1>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-canvas-soft">
            <Bookmark size={24} strokeWidth={1.75} className="text-muted" aria-hidden />
          </span>
          <p className="text-[19px] font-medium tracking-[-0.015em]">
            {COPY.saved.emptyTitle}
          </p>
          <p className="max-w-[240px] text-sm leading-[1.5] text-ink-50">
            {COPY.saved.emptySub}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-4">
          {saved.map((plan) => {
            const place = placeById(plan.placeId);
            if (!place) return null;
            const people = plan.withPeople
              .map((id) => personById(id))
              .filter((p) => p !== undefined);
            return (
              <PlanRow
                key={plan.id}
                place={place}
                people={people}
                onPress={() => router.push(`/place/${place.id}`)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
