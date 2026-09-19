"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import {
  BIZ_LIVE,
  EMPTY_DRAFT,
  BIZ_PAST,
  BUSINESS,
  COPY,
  bizWhen,
  placeToBizEvent,
  type BizEvent,
} from "@/data/seed";
import { usePlaces } from "@/state/places";

/** A live row. The orange dot + time only appears on the one starting today. */
function LiveRow({ event, onPress }: { event: BizEvent; onPress: () => void }) {
  const when = bizWhen(event);
  const soon = when.startsWith("TONIGHT") || when.startsWith("TODAY");
  const filled =
    event.seats && event.seats > 0 ? Math.min(100, (event.going / event.seats) * 100) : 0;
  const maybe =
    event.seats && event.seats > 0 ? Math.min(100 - filled, ((event.maybe ?? 0) / event.seats) * 100) : 0;

  return (
    <button
      onClick={onPress}
      className="w-full rounded-card border border-ink-08 p-[14px_16px] text-left"
    >
      <div className="flex items-start gap-3">
        <span
          className="photo h-[52px] w-[52px] shrink-0 rounded-[12px]"
          style={{ backgroundImage: `url(${event.image})` }}
        />
        <span className="block min-w-0 flex-1">
          <span className="flex items-center gap-[7px]">
            {soon && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-pop" />}
            <span
              className={`truncate text-[11px] font-medium tracking-[0.06em] ${
                soon ? "text-pop" : "text-muted"
              }`}
            >
              {when}
            </span>
          </span>
          <span className="mt-1 block truncate text-base font-medium">{event.title}</span>
          <span className="mt-0.5 block text-xs text-muted">
            {COPY.business.interestedGoing(event.interested, event.going)}
          </span>
        </span>
      </div>
      {event.seats ? (
        <>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-canvas">
            <span className="bg-pop" style={{ width: `${filled}%` }} />
            <span className="bg-hero-soft" style={{ width: `${maybe}%` }} />
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-muted">
            <span>{COPY.business.seatsOf(event.going, event.seats)}</span>
            {event.maybe ? <span>{COPY.business.maybeList(event.maybe)}</span> : null}
          </div>
        </>
      ) : null}
    </button>
  );
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { ready, myEvents, setDraft } = usePlaces();

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-surface" />;
  }

  // Newest first, so the one you just made is the first thing on the shelf.
  const live = [...myEvents].reverse().map(placeToBizEvent).concat(BIZ_LIVE);
  const open = (id: string) => router.push(`/business/event/${id}`);

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="bg-hero px-5 pb-[22px] pt-safe text-white">
        <div className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-sm font-medium text-hero">
              {BUSINESS.initials}
            </span>
            <div>
              <div className="text-[17px] font-medium">{BUSINESS.name}</div>
              <div className="mt-px text-xs text-white/75">{BUSINESS.verifiedLabel}</div>
            </div>
          </div>
          <button
            onClick={() => router.push("/sign-in")}
            aria-label="Sign out"
            className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/18"
          >
            <MoreHorizontal size={17} strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/70">
          {COPY.business.last30}
        </p>
        <div className="mt-2.5 flex gap-6">
          {BUSINESS.stats.map((s) => (
            <div key={s.label}>
              <div
                className={`text-[30px] font-medium tracking-[-0.02em] ${
                  "accent" in s && s.accent ? "text-accent-warm" : ""
                }`}
              >
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] text-white/72">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-[18px]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-medium">{COPY.business.live}</h2>
          <span className="text-[11px] font-medium tracking-[0.08em] text-muted">
            {COPY.business.liveCount(live.length)}
          </span>
        </div>
        {live.map((e) => (
          <LiveRow key={e.id} event={e} onPress={() => open(e.id)} />
        ))}

        <h2 className="pt-3 text-[17px] font-medium">{COPY.business.past}</h2>
        {BIZ_PAST.map((e) => {
          const pct = e.going > 0 ? Math.round(((e.turnedUp ?? 0) / e.going) * 100) : 0;
          return (
            <button
              key={e.id}
              onClick={() => open(e.id)}
              className="flex items-center gap-3 rounded-tile bg-canvas-soft p-[13px_14px] text-left"
            >
              <span className="block min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{e.title}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {COPY.business.pastLine(e.turnedUp ?? 0, e.going, pct)}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-hero">
                {COPY.business.report}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-ink-07 bg-surface px-5 pt-3 pb-safe">
        <button
          onClick={() => {
            setDraft(EMPTY_DRAFT);
            router.push("/business/new");
          }}
          className="button flex h-[54px] w-full items-center justify-center bg-pop text-base font-medium text-white shadow-pop"
        >
          {COPY.business.create}
        </button>
      </div>
    </main>
  );
}
