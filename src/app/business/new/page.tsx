"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  COPY,
  PHOTO_CHOICES,
  SHAPE_CHIPS,
  reachEstimate,
  type InterestTag,
} from "@/data/seed";
import { usePlaces } from "@/state/places";

const FIELD =
  "mt-[7px] h-[46px] w-full rounded-tile bg-canvas-soft px-3.5 text-[15px] outline-none placeholder:text-ink-42";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
      {children}
    </span>
  );
}

/** Next seven days, so a date is always in the future without a date picker. */
const DAYS = Array.from({ length: 7 }, (_, i) => i);

export default function BusinessNewEventPage() {
  const router = useRouter();
  const { ready, draft, setDraft } = usePlaces();
  const [pickingPhoto, setPickingPhoto] = useState(false);

  if (!ready) {
    return <main className="min-h-dvh flex-1 bg-surface" />;
  }

  const dayLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (offset === 0) return "Today";
    if (offset === 1) return "Tomorrow";
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  };

  const toggleTag = (tag: InterestTag) =>
    setDraft({
      ...draft,
      tags: draft.tags.includes(tag)
        ? draft.tags.filter((t) => t !== tag)
        : [...draft.tags, tag],
    });

  const ready_ = draft.title.trim().length > 0;

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-surface">
      <div className="px-5 pt-safe">
        <div className="flex items-center justify-between pt-5">
          <button
            onClick={() => router.push("/business")}
            className="text-sm font-medium text-muted"
          >
            {COPY.business.form.cancel}
          </button>
          <span className="text-xs font-medium text-muted">
            {COPY.business.form.step(1, 2)}
          </span>
        </div>
        <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-canvas">
          <div className="h-full w-1/2 bg-pop" />
        </div>
        <h1 className="mt-[18px] text-[26px] font-medium tracking-[-0.02em]">
          {COPY.business.form.title}
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 pt-4">
        <div>
          <Label>{COPY.business.form.name}</Label>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder={COPY.business.form.namePlaceholder}
            aria-label={COPY.business.form.name}
            className={FIELD}
          />
        </div>

        <div>
          <Label>{COPY.business.form.line}</Label>
          <input
            value={draft.line}
            onChange={(e) => setDraft({ ...draft, line: e.target.value })}
            placeholder={COPY.business.form.linePlaceholder}
            aria-label={COPY.business.form.line}
            className={FIELD}
          />
        </div>

        <div className="flex gap-2.5">
          <div className="min-w-0 flex-1">
            <Label>{COPY.business.form.date}</Label>
            <select
              value={draft.dayOffset}
              onChange={(e) => setDraft({ ...draft, dayOffset: Number(e.target.value) })}
              aria-label={COPY.business.form.date}
              className={`${FIELD} appearance-none`}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {dayLabel(d)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <Label>{COPY.business.form.starts}</Label>
            <input
              type="time"
              value={`${String(draft.hour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                if (!Number.isNaN(h) && !Number.isNaN(m)) {
                  setDraft({ ...draft, hour: h, minute: m });
                }
              }}
              aria-label={COPY.business.form.starts}
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <Label>{COPY.business.form.shape}</Label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SHAPE_CHIPS.map((c) => {
              const on = draft.tags.includes(c.tag);
              return (
                <button
                  key={c.tag}
                  onClick={() => toggleTag(c.tag)}
                  aria-pressed={on}
                  className={`rounded-full px-3.5 py-2.5 text-[13px] font-medium ${
                    on ? "bg-hero text-white" : "border-[1.5px] border-ink-16"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2.5">
          <div className="min-w-0 flex-1">
            <Label>{COPY.business.form.seats}</Label>
            <input
              inputMode="numeric"
              value={draft.seats}
              onChange={(e) => setDraft({ ...draft, seats: e.target.value })}
              placeholder="70"
              aria-label={COPY.business.form.seats}
              className={FIELD}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label>{COPY.business.form.perHead}</Label>
            <input
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              placeholder="R 280"
              aria-label={COPY.business.form.perHead}
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <Label>{COPY.business.form.photo}</Label>
          <div
            className="photo relative mt-2 h-[84px] w-full overflow-hidden rounded-tile"
            style={{ backgroundImage: `url(${draft.image})` }}
          >
            <button
              onClick={() => setPickingPhoto((v) => !v)}
              className="absolute bottom-2.5 right-2.5 rounded-full bg-white/94 px-3 py-[7px] text-xs font-medium"
            >
              {COPY.business.form.replace}
            </button>
          </div>
          {pickingPhoto && (
            // Repo images only — image upload is permanently out of scope (§1.9).
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1">
              {PHOTO_CHOICES.map((src) => (
                <button
                  key={src}
                  onClick={() => {
                    setDraft({ ...draft, image: src });
                    setPickingPhoto(false);
                  }}
                  aria-label="Use this photo"
                  className={`photo relative h-[58px] w-[74px] shrink-0 rounded-[10px] ${
                    draft.image === src ? "ring-2 ring-pop ring-offset-2" : ""
                  }`}
                  style={{ backgroundImage: `url(${src})` }}
                >
                  {draft.image === src && (
                    <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-black/35">
                      <Check size={18} strokeWidth={3} className="text-white" aria-hidden />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-tile bg-canvas p-[12px_16px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-hero" />
          <span className="text-[13px] leading-[1.4] text-ink-60">
            {COPY.business.form.reach(reachEstimate(draft.tags.length))}
          </span>
        </div>
      </div>

      <div className="border-t border-ink-07 bg-surface px-5 pt-3 pb-safe">
        <button
          onClick={() => router.push("/business/preview")}
          disabled={!ready_}
          className="button flex h-[54px] w-full items-center justify-center bg-pop text-base font-medium text-white shadow-pop disabled:opacity-45 disabled:shadow-none"
        >
          {ready_ ? COPY.business.form.cta : COPY.business.form.incomplete}
        </button>
      </div>
    </main>
  );
}
