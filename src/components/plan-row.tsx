"use client";

import { formatDayLabel, formatLocal, type Person, type Place } from "@/data/seed";
import { AvatarStack } from "./avatar-stack";

export function PlanRow({
  place,
  people,
}: {
  place: Place;
  people: Person[];
}) {
  const meta = `${formatDayLabel(place)} · ${formatLocal(place)}`.toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-big bg-canvas-soft p-3.5">
      <span
        className="photo h-14 w-14 shrink-0 rounded-xl"
        style={{ backgroundImage: `url(${place.image})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="kicker">{meta}</div>
        <div className="mt-0.5 text-base font-medium">{place.title}</div>
      </div>
      {people.length > 0 && <AvatarStack people={people} size={22} />}
    </div>
  );
}
