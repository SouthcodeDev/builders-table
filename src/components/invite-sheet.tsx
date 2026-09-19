"use client";

import { Drawer, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { COPY, formatDayLabel, formatLocal, type Person, type Place } from "@/data/seed";

const CHIP_STYLES = ["bg-hero-deep", "bg-accent", "bg-hero-soft", "bg-teal"] as const;

export function InviteSheet({
  open,
  onOpenChange,
  place,
  friends,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: Place;
  friends: Person[];
  onSend: (toUserIds: string[], note: string) => void;
}) {
  const state = useOverlayState({ isOpen: open, onOpenChange });
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const send = () => {
    if (selected.length === 0) return;
    onSend(selected, note);
    setSelected([]);
    setNote("");
    state.close();
  };

  const cta =
    selected.length === 0
      ? "Send"
      : selected.length === 1
        ? COPY.invite.sendNamed((friends.find((f) => f.id === selected[0])?.name ?? "").split(" ")[0])
        : COPY.invite.send(selected.length);

  return (
    <Drawer.Root state={state}>
      <Drawer.Backdrop />
      {/*
        Drawer.Content is the full-screen positioning layer — HeroUI styles it
        `fixed inset-0 flex items-end`. The panel is Drawer.Dialog. Putting the panel's
        content straight into Content made every child a flex item of that row, which
        laid the sheet out sideways and pushed the send button off screen.
      */}
      <Drawer.Content placement="bottom">
        <Drawer.Dialog
          aria-label={COPY.invite.title}
          className="mx-auto flex max-h-[84dvh] w-full flex-col gap-0 rounded-t-[28px] bg-surface p-0 px-5 pt-6 pb-safe"
        >
          <span className="text-[24px] font-medium leading-[1.15] tracking-[-0.02em]">
            {COPY.invite.title}
          </span>
          <p className="mt-1 text-[13px] text-ink-50">
            {COPY.invite.sub(place.title, formatDayLabel(place), formatLocal(place))}
          </p>

          <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
            {friends.map((f, i) => {
              const isOn = selected.includes(f.id);
              const tone = CHIP_STYLES[i % CHIP_STYLES.length];
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  aria-pressed={isOn}
                  className="flex shrink-0 items-center gap-3 border-b border-ink-07 py-3.5 text-left last:border-b-0"
                >
                  <span
                    className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-[13px] font-medium ${
                      tone === "bg-hero-soft" ? "text-hero-deep" : "text-white"
                    } ${tone}`}
                  >
                    {f.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px]">{f.name}</span>
                    <span className="block truncate text-[13px] text-ink-50">{f.note}</span>
                  </span>
                  <span
                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${
                      isOn ? "border-[2px] border-hero" : "border-[1.5px] border-ink-16"
                    }`}
                  >
                    {isOn && <span className="h-[11px] w-[11px] rounded-full bg-hero" />}
                  </span>
                </button>
              );
            })}
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={COPY.invite.notePlaceholder}
            aria-label={COPY.invite.notePlaceholder}
            className="mt-4 h-[44px] w-full shrink-0 bg-transparent text-[15px] outline-none placeholder:text-ink-42"
          />
          <button
            onClick={send}
            disabled={selected.length === 0}
            className="button mt-1 flex h-[54px] w-full shrink-0 items-center justify-center bg-pop text-base font-medium text-white shadow-pop disabled:opacity-50 disabled:shadow-none"
          >
            {cta}
          </button>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Root>
  );
}
