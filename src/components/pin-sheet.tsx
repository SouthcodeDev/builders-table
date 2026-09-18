"use client";

import { Navigation } from "lucide-react";
import { COPY, formatDayLabel, timeLabel, type Attendance, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { AvatarStack } from "./avatar-stack";

export function PinSheet({
  place,
  distanceKm,
  attendance,
  onGoing,
  onDirections,
}: {
  place: Place;
  distanceKm: number;
  attendance: Attendance;
  onGoing: () => void;
  onDirections: () => void;
}) {
  const meta = [
    formatDayLabel(place),
    timeLabel(place),
    formatDistance(distanceKm),
    place.price ?? null,
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const attending = attendance.friends.length > 0 ? attendance.friends : null;
  const avatarLabel = attending
    ? attending.length === 1
      ? `${attending[0].name.split(" ")[0]} is in`
      : `${attending.map((f) => f.name.split(" ")[0]).join(", ")} are in`
    : attendance.base > 0
      ? `${attendance.base} going`
      : null;

  return (
    <div className="rounded-t-[28px] rounded-b-[14px] bg-surface px-[18px] pb-5 pt-3 shadow-sheet">
      <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-ink-16" />
      <div className="flex gap-3.5">
        <span
          className="photo h-[92px] w-[92px] shrink-0 rounded-tile"
          style={{ backgroundImage: `url(${place.image})` }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="kicker">{meta}</span>
          <span className="text-[19px] font-medium leading-[1.1] tracking-[-0.015em]">
            {place.title}
          </span>
          {avatarLabel && (
            <span className="mt-0.5">
              <AvatarStack
                people={attending ?? []}
                size={22}
                label={avatarLabel}
                labelClass="text-xs text-muted"
              />
            </span>
          )}
        </div>
      </div>
      <div className="mt-3.5 flex gap-2.5">
        <button
          onClick={onGoing}
          className="button flex h-[50px] flex-1 items-center justify-center bg-pop text-[15px] font-medium text-white shadow-pop"
        >
          {COPY.event.goingIn}
        </button>
        <button
          onClick={onDirections}
          aria-label={COPY.event.directions}
          className="grid h-[50px] w-[50px] place-items-center rounded-full border-[1.5px] border-ink-16"
        >
          <Navigation size={18} strokeWidth={2} className="text-hero" aria-hidden />
        </button>
      </div>
    </div>
  );
}
