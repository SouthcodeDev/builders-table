"use client";

import { Drawer, useOverlayState } from "@heroui/react";
import { Check } from "lucide-react";
import {
  COPY,
  clock24,
  formatDayLabel,
  formatLocal,
  type Person,
  type Place,
} from "@/data/seed";
import { AvatarStack } from "./avatar-stack";

/** The nudge is the only push this product ever sends: 45 min before the start. */
const NUDGE_LEAD_MIN = -45;

export function InviteSentSheet({
  open,
  onOpenChange,
  place,
  sentTo,
  me,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: Place;
  sentTo: Person[];
  /** You, on the avatar stack of the mini card — you're going too. */
  me: Person | null;
  onDone: () => void;
}) {
  const state = useOverlayState({ isOpen: open, onOpenChange });

  const first = sentTo.map((p) => p.name.split(" ")[0]);
  const names =
    first.length > 1
      ? `${first.slice(0, -1).join(", ")} and ${first[first.length - 1]}`
      : (first[0] ?? "They");
  const sentAt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  return (
    <Drawer.Root state={state}>
      <Drawer.Backdrop />
      <Drawer.Content placement="bottom">
        <Drawer.Dialog
          aria-label={COPY.invite.sentTitle(sentTo.length)}
          className="mx-auto flex w-full flex-col gap-0 rounded-t-[28px] bg-surface p-0 px-5 pt-6 pb-safe"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-pop">
              <Check size={18} strokeWidth={3} className="text-white" aria-hidden />
            </span>
            <span className="kicker">{COPY.invite.sentKicker(sentAt)}</span>
          </div>

          <h2 className="mt-4 text-[28px] font-medium leading-[1.12] tracking-[-0.025em]">
            {COPY.invite.sentTitle(sentTo.length)}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink-60">
            {COPY.invite.sentBody(names, clock24(place, NUDGE_LEAD_MIN))}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-tile border border-ink-08 p-3">
            <span
              className="photo h-[54px] w-[54px] shrink-0 rounded-[10px]"
              style={{ backgroundImage: `url(${place.image})` }}
            />
            <div className="min-w-0 flex-1">
              <div className="kicker">
                {`${formatDayLabel(place)} ${formatLocal(place)} · ${place.area}`}
              </div>
              <div className="mt-0.5 truncate text-base font-medium">{place.title}</div>
              <span className="mt-1.5 block">
                <AvatarStack people={me ? [...sentTo, me] : sentTo} size={24} max={4} />
              </span>
            </div>
          </div>

          <button
            onClick={onDone}
            className="button mt-5 flex h-[54px] w-full items-center justify-center border-[1.5px] border-lime text-[15px] font-medium"
          >
            {COPY.invite.done}
          </button>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Root>
  );
}
