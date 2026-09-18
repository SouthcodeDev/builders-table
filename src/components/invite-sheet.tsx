"use client";

import { Drawer, Input, useOverlayState } from "@heroui/react";
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
        ? COPY.invite.sendNamed((personByIdName(selected[0], friends) ?? "").split(" ")[0])
        : COPY.invite.send(selected.length);

  return (
    <Drawer.Root state={state}>
      <Drawer.Backdrop />
      <Drawer.Content
        placement="bottom"
        className="mx-auto w-full max-w-[390px] rounded-t-[28px] bg-surface px-5 pb-safe pt-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-[22px] font-medium tracking-[-0.015em]">{COPY.invite.title}</span>
          <button
            onClick={send}
            disabled={selected.length === 0}
            className="text-sm font-medium text-hero disabled:text-ink-42"
          >
            Send
          </button>
        </div>
        <p className="mt-1 text-[13px] text-ink-50">
          {place.title} · {formatDayLabel(place)} {formatLocal(place)}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {friends.map((f, i) => {
            const isOn = selected.includes(f.id);
            const tone = CHIP_STYLES[i % CHIP_STYLES.length];
            return (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className="flex items-center gap-3 rounded-tile bg-canvas-soft p-3 text-left"
              >
                <span
                  className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[11px] font-medium ${
                    tone === "bg-hero-soft" ? "text-hero-deep" : "text-white"
                  } ${tone}`}
                >
                  {f.initials}
                </span>
                <span className="flex-1 text-[15px]">{f.name.split(" ")[0]}</span>
                <span
                  className={`grid h-[22px] w-[22px] place-items-center rounded-full ${
                    isOn ? "bg-hero" : "border-[1.5px] border-ink-16"
                  }`}
                >
                  {isOn && (
                    <span className="h-[8px] w-[5px] -translate-y-px -rotate-45 border-x-2 border-b-2 border-white" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={COPY.invite.notePlaceholder}
          aria-label={COPY.invite.notePlaceholder}
          className="h-[52px] rounded-tile bg-canvas-soft px-4 text-sm placeholder:text-ink-42"
        />
        <button
          onClick={send}
          disabled={selected.length === 0}
          className="button mt-6 flex h-[54px] w-full items-center justify-center bg-hero text-base font-medium text-white shadow-hero disabled:opacity-50"
        >
          {cta}
        </button>
      </Drawer.Content>
    </Drawer.Root>
  );
}

function personByIdName(id: string, friends: Person[]): string | undefined {
  return friends.find((f) => f.id === id)?.name;
}
