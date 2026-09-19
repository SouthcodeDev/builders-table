"use client";

import { Drawer, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { COPY, formatDayLabel, timeLabel, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";

export function BounceSheet({
  open,
  onOpenChange,
  place,
  distanceKm,
  why,
  onCheck,
  onSkip,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: Place;
  distanceKm: number;
  /** Why this one is outside the user's usual — derived from their own tags. */
  why: string;
  onCheck: () => void;
  onSkip: () => void;
}) {
  const state = useOverlayState({ isOpen: open, onOpenChange });
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (r: string) =>
    setPicked((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const meta = [formatDayLabel(place), timeLabel(place), formatDistance(distanceKm)]
    .join(" · ")
    .toUpperCase();

  return (
    <Drawer.Root state={state}>
      <Drawer.Backdrop />
      <Drawer.Content placement="bottom">
        <Drawer.Dialog
          aria-label={COPY.bounce.title}
          className="mx-auto flex max-h-[86dvh] w-full flex-col gap-0 overflow-y-auto rounded-t-[28px] bg-surface p-0 px-5 pt-3 pb-safe"
        >
          <span className="mx-auto mb-5 h-1 w-[42px] shrink-0 rounded-full bg-ink-16" />

          <span className="text-[24px] font-medium tracking-[-0.02em]">
            {COPY.bounce.title}
          </span>
          <p className="mt-1.5 max-w-[300px] text-[15px] leading-[1.5] text-ink-60">
            {COPY.bounce.sub}
          </p>

          <div className="mt-4 flex shrink-0 items-center gap-3.5 rounded-tile bg-canvas-soft p-3">
            <span
              className="photo h-[68px] w-[68px] shrink-0 rounded-[12px]"
              style={{ backgroundImage: `url(${place.image})` }}
            />
            <span className="block min-w-0 flex-1">
              <span className="kicker block">{meta}</span>
              <span className="mt-1 block truncate text-[17px] font-medium tracking-[-0.015em]">
                {place.title}
              </span>
              <span className="mt-1 block text-[12px] leading-[1.4] text-ink-50">{why}</span>
            </span>
          </div>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            {COPY.bounce.reasonsHeading}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {COPY.bounce.reasons.map((r) => {
              const on = picked.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggle(r)}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium ${
                    on ? "bg-hero text-white" : "border-[1.5px] border-ink-16"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex shrink-0 gap-2.5">
            <button
              onClick={onCheck}
              className="button flex h-[54px] flex-1 items-center justify-center bg-pop text-base font-medium text-white shadow-pop"
            >
              {COPY.bounce.check}
            </button>
            <button
              onClick={onSkip}
              className="button flex h-[54px] w-[110px] items-center justify-center border-[1.5px] border-ink-16 text-[15px] font-medium"
            >
              {COPY.bounce.skip}
            </button>
          </div>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Root>
  );
}
