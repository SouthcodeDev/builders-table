"use client";

import { COPY, formatDayLabel, formatLocal, type Attendance, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { AvatarStack } from "./avatar-stack";

export function DeckCard({
  place,
  distanceKm,
  reason,
  attendance,
}: {
  place: Place;
  distanceKm: number;
  reason: string;
  attendance: Attendance;
}) {
  const meta = [
    formatDayLabel(place),
    formatLocal(place),
    formatDistance(distanceKm),
    place.price ?? null,
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const attending = attendance.friends.length > 0 ? attendance.friends : null;

  return (
    <div
      className="photo absolute inset-0 overflow-hidden rounded-deckcard bg-ink shadow-deckcard"
      style={{ backgroundImage: `url(${place.image})` }}
    >
      <span className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,14,0.92)] via-[rgba(8,7,14,0.35)_45%] to-[rgba(8,7,14,0.05)]" />
      <span className="absolute inset-x-4.5 bottom-4 flex flex-col gap-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/75">
          {meta}
        </span>
        <span className="text-2xl font-medium leading-[1.1] tracking-[-0.015em] text-white">
          {place.title}
        </span>
        <span className="rounded-xl bg-white/14 p-3 backdrop-blur-md">
          <span className="block text-[13px] leading-[1.4] text-white">{reason}</span>
        </span>
        {attending && (
          <span className="pt-0.5">
            <AvatarStack
              people={attending}
              size={20}
              label={
                attending.length === 1
                  ? `${attending[0].name.split(" ")[0]} said yes to this`
                  : `${attending.length} friends said yes to this`
              }
              labelClass="text-xs text-white/85"
            />
          </span>
        )}
      </span>
      <span className="sr-only">{COPY.deck.hint}</span>
    </div>
  );
}
