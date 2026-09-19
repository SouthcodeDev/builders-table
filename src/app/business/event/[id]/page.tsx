"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  COPY,
  bizEventById,
  bizWhen,
  placeById,
  placeToBizEvent,
  reportFor,
} from "@/data/seed";
import { usePlaces } from "@/state/places";

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="min-w-0 flex-1 rounded-tile bg-canvas-soft p-3.5">
      <div className={`text-[24px] font-medium ${accent ? "text-pop" : ""}`}>{value}</div>
      <div className="mt-[3px] text-[10px] uppercase tracking-[0.06em] text-muted">
        {label}
      </div>
    </div>
  );
}

export default function BusinessReportPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { ready } = usePlaces();

  // Gate on ready: the created-event registry is only populated after hydrate, so
  // looking up before that would render "gone" on the server and flip on the client.
  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-surface" />;
  }

  const created = placeById(params.id);
  const event = bizEventById(params.id) ?? (created ? placeToBizEvent(created) : undefined);

  if (!event) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center bg-surface px-6 text-center text-sm text-ink-50">
        No report for that one.
      </main>
    );
  }

  const report = reportFor(event);
  const past = event.turnedUp !== undefined;
  const maxBar = Math.max(...report.byDay);

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="px-5 pt-safe">
        <button
          onClick={() => router.push("/business")}
          aria-label="Back"
          className="mt-5 grid h-[34px] w-[34px] place-items-center rounded-full bg-canvas-soft"
        >
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
        </button>
        <h1 className="mt-4 text-[26px] font-medium leading-[1.1] tracking-[-0.02em]">
          {event.title}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          {past
            ? COPY.business.report_.closed(event.going, event.turnedUp ?? 0)
            : `${bizWhen(event)} · ${COPY.business.report_.liveState(
                event.interested,
                event.going,
              )}`}
        </p>
        <div className="mt-4 flex gap-2">
          <Tile value={report.turnUpRate} label={COPY.business.report_.turnUp} accent />
          <Tile value={report.impressions} label={COPY.business.report_.impressions} />
          <Tile value={report.savedRate} label={COPY.business.report_.saved} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4 pt-5">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">{COPY.business.report_.byDay}</h2>
            <span className="text-[11px] text-muted">{report.peakLabel}</span>
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {report.byDay.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-[7px]">
                <div className="flex h-[118px] w-full items-end">
                  <div
                    className={`w-full rounded-t-[6px] rounded-b-[3px] ${
                      v === maxBar ? "bg-pop" : "bg-hero-soft"
                    }`}
                    style={{ height: `${v}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted">
                  {COPY.business.report_.dayAxis[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[15px] font-medium">{COPY.business.report_.whoCame}</h2>
          <div className="mt-3 flex flex-col gap-[11px]">
            {report.whoCame.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[13px]">{r.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                  <span
                    className={`block h-full rounded-full ${r.tone}`}
                    style={{ width: `${r.pct}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-hero p-[16px_18px] text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/72">
            {COPY.business.report_.nextKicker}
          </p>
          <p className="mt-[7px] text-[15px] leading-[1.45]">{report.nextMove}</p>
        </div>
      </div>

      <div className="flex gap-2.5 border-t border-ink-07 bg-surface px-5 pt-3 pb-safe">
        <button
          onClick={() => router.push("/business/new")}
          className="button flex h-[54px] flex-1 items-center justify-center bg-pop text-base font-medium text-white shadow-pop"
        >
          {COPY.business.report_.again}
        </button>
        <button
          onClick={() => router.push("/business")}
          className="button flex h-[54px] w-[110px] items-center justify-center border-[1.5px] border-ink-16 text-[15px] font-medium"
        >
          {COPY.business.report_.export}
        </button>
      </div>
    </main>
  );
}
