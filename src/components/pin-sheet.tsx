"use client";

import { COPY, formatDayLabel, timeLabel, type Attendance, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { AvatarStack } from "./avatar-stack";

/**
 * The toast that rises when you tap a pin. It commits to nothing — tapping through
 * opens the detail page, where saying yes actually lives. It is not draggable, so
 * it carries no grabber.
 */
export function PinSheet({
  place,
  distanceKm,
  attendance,
  onCheck,
}: {
  place: Place;
  distanceKm: number;
  attendance: Attendance;
  onCheck: () => void;
}) {
  const meta = [formatDayLabel(place), timeLabel(place), formatDistance(distanceKm)]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const attending = attendance.friends;

  return (
    <div className="rounded-big bg-surface p-3.5 shadow-sheet">
      <div className="flex gap-3.5">
        <span
          className="photo h-[104px] w-[104px] shrink-0 rounded-tile"
          style={{ backgroundImage: `url(${place.image})` }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-2">
            <span className="kicker truncate">{meta}</span>
            {attending.length > 0 && (
              <AvatarStack people={attending} size={18} max={3} />
            )}
          </div>
          <span className="mt-1 line-clamp-2 text-[18px] font-medium leading-[1.15] tracking-[-0.015em]">
            {place.title}
          </span>
          <button
            onClick={onCheck}
            className="button mt-auto flex h-[44px] w-full items-center justify-center bg-pop text-sm font-medium text-white shadow-pop"
          >
            {COPY.bounce.check}
          </button>
        </div>
      </div>
    </div>
  );
}
