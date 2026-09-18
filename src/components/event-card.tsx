"use client";

import { COPY, formatDayLabel, formatLocal, type Attendance, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";
import { isStartingSoon, minutesUntil } from "@/data/schedule";
import { AvatarStack } from "./avatar-stack";

export function EventCard({
  place,
  distanceKm,
  attendance,
  variant = "compact",
  timePill,
  subline,
  onPress,
}: {
  place: Place;
  distanceKm: number;
  attendance: Attendance;
  variant?: "featured" | "compact";
  /** Replaces the "Starts in…" pill with a plain clock pill (Tokyo treatment). */
  timePill?: string;
  /** Extra body line under the title. */
  subline?: string;
  onPress: () => void;
}) {
  const featured = variant === "featured";
  const mins = minutesUntil(place);
  const showStartsPill = featured && !timePill && isStartingSoon(place, 120);
  const meta = [
    timePill ? null : formatDayLabel(place),
    formatLocal(place),
    formatDistance(distanceKm),
    place.price ?? null,
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  const attending = attendance.friends.length > 0 ? attendance.friends : null;

  return (
    <button
      onClick={onPress}
      className={`photo relative w-full shrink-0 overflow-hidden rounded-big text-left shadow-card ${
        featured ? "h-[200px]" : "h-[200px]"
      }`}
      style={{ backgroundImage: `url(${place.image})` }}
    >
      <span className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[rgba(8,7,14,0.9)] to-transparent" />
      {showStartsPill && (
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[rgba(10,10,10,0.74)] px-3 py-1.5 text-[11px] font-medium text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-hero-soft" />
          {COPY.event.startsIn(mins)}
        </span>
      )}
      {timePill && (
        <span className="absolute left-3 top-3 rounded-full bg-[rgba(10,10,10,0.74)] px-3 py-1.5 text-[11px] font-medium text-white">
          {timePill}
        </span>
      )}
      <span className="absolute inset-x-3.5 bottom-3 flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/80">
          {meta}
        </span>
        <span
          className={`font-medium leading-[1.08] tracking-[-0.015em] text-white ${
            featured ? "text-[21px]" : "text-lg"
          }`}
        >
          {place.title}
        </span>
        {subline && <span className="text-xs leading-[1.4] text-white/80">{subline}</span>}
        {attending ? (
          <span className="pt-0.5">
            <AvatarStack
              people={attending}
              size={24}
              label={
                attending.length === 1
                  ? `${attending[0].name.split(" ")[0]} is going`
                  : `${attending.length} people you know are going`
              }
            />
          </span>
        ) : attendance.base > 0 ? (
          <span className="text-xs text-white/75">{attendance.base} going</span>
        ) : null}
      </span>
    </button>
  );
}
