"use client";

import { COPY, formatDayLabel, formatLocal, type Person, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { LogoMark } from "./logo-mark";

export function InviteReceivedCard({
  from,
  place,
  distanceKm,
  timeLabel,
  onAccept,
  onDecline,
}: {
  from: Person;
  place: Place;
  distanceKm: number;
  timeLabel: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const meta = [
    formatDayLabel(place),
    formatLocal(place),
    formatDistance(distanceKm),
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const what = `${place.title}, ${formatDayLabel(place)} ${formatLocal(place)}`;

  return (
    <div className="flex flex-col gap-3.5 rounded-big bg-hero p-[18px] text-white shadow-hero">
      <div className="flex items-center gap-2.5">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white/18">
          <LogoMark size={13} color="#FFFFFF" />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/78">
          {COPY.inviteReceived.kicker}
        </span>
        <span className="ml-auto text-xs text-white/60">{timeLabel}</span>
      </div>
      <p className="text-[22px] font-medium leading-[1.2] tracking-[-0.015em]">
        {COPY.inviteReceived.title(from.name.split(" ")[0], what)}
      </p>
      <div className="flex items-center gap-3 rounded-tile bg-white/14 p-3">
        <span
          className="photo h-11 w-11 shrink-0 rounded-[10px]"
          style={{ backgroundImage: `url(${place.image})` }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/75">
            {meta}
          </div>
          <div className="mt-0.5 text-[15px] font-medium">{place.title}</div>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={onAccept}
          className="button flex h-12 flex-1 items-center justify-center bg-surface text-[15px] font-medium text-hero"
        >
          {COPY.inviteReceived.accept}
        </button>
        <button
          onClick={onDecline}
          className="button flex h-12 flex-1 items-center justify-center border-[1.5px] border-white/50 text-[15px] font-medium text-white"
        >
          {COPY.inviteReceived.decline}
        </button>
      </div>
    </div>
  );
}
