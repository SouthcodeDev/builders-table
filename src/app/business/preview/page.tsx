"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import {
  COPY,
  closingLabel,
  draftToPlace,
  formatLocal,
  weekdayOf,
} from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { usePlaces } from "@/state/places";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-tile bg-canvas-soft px-3 py-2.5">
      <span className="kicker">{label}</span>
      <span className="truncate text-[15px] font-medium">{value}</span>
    </div>
  );
}

/**
 * The card exactly as a consumer will see it, with Confirm/Cancel instead of the
 * consumer actions. Deliberately the same layout as /place/[id] — one concept,
 * one look (§1.7) — but it renders the unsaved draft, which has no id yet.
 */
export default function BusinessPreviewPage() {
  const router = useRouter();
  const { ready, draft, publishDraft, distanceTo } = usePlaces();
  const empty = ready && !draft.title.trim();

  // A cold reload onto the preview with nothing drafted (iOS evicts PWAs) goes
  // back to the form rather than rendering an empty card.
  useEffect(() => {
    if (empty) router.replace("/business/new");
  }, [empty, router]);

  if (!ready || empty) {
    return <main className="min-h-dvh flex-1 bg-canvas" />;
  }

  const place = draftToPlace(draft, "draft-preview");
  const isEvent = place.kind === "event";

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col bg-canvas">
      <div
        className="photo relative h-[292px] w-full shrink-0"
        style={{ backgroundImage: `url(${place.image})` }}
      >
        <span className="scrim-tile absolute inset-x-0 bottom-0 h-[45%]" />
        <button
          onClick={() => router.push("/business/new")}
          aria-label="Back"
          className="absolute left-5 grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(10,10,10,0.4)] backdrop-blur-sm"
          style={{ top: "max(env(safe-area-inset-top), 54px)" }}
        >
          <ArrowLeft size={18} strokeWidth={2.25} className="text-white" aria-hidden />
        </button>
        <span
          className="absolute right-5 rounded-full bg-[rgba(10,10,10,0.6)] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white backdrop-blur-sm"
          style={{ top: "max(env(safe-area-inset-top), 56px)" }}
        >
          {COPY.business.preview.kicker}
        </span>
      </div>

      <div className="relative -mt-[30px] flex min-h-0 flex-1 flex-col gap-5 rounded-t-[28px] bg-surface px-5 pb-[170px] pt-7">
        <div>
          <h1 className="text-[29px] font-medium leading-[1.08] tracking-[-0.025em]">
            {place.title}
          </h1>
          <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-pop">
            {`${weekdayOf(place)} · ${place.area}`}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Stat
            label={isEvent ? COPY.event.statStarts : COPY.event.statCloses}
            value={(isEvent ? formatLocal(place) : closingLabel(place)).toUpperCase()}
          />
          <Stat
            label={COPY.event.statAway}
            value={formatDistance(distanceTo(place)).toLowerCase()}
          />
          {place.price && <Stat label={COPY.event.statCosts} value={place.price} />}
        </div>

        <p className="text-[15px] leading-[1.6] text-ink-60">{place.blurb}</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full flex-col gap-2.5 bg-surface px-5 pt-3 pb-safe">
        <button
          onClick={() => {
            const created = publishDraft();
            router.push(`/business/event/${created.id}`);
          }}
          className="button flex h-[54px] w-full items-center justify-center gap-2 bg-pop text-[15px] font-medium text-white shadow-pop"
        >
          {COPY.business.preview.confirm}
          <Check size={16} strokeWidth={2.75} aria-hidden />
        </button>
        <button
          onClick={() => router.push("/business/new")}
          className="button flex h-[54px] w-full items-center justify-center gap-2 border-[1.5px] border-ink-16 text-[15px] font-medium"
        >
          {COPY.business.preview.cancel}
          <X size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </main>
  );
}
