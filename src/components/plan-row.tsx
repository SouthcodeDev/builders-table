"use client";

import { formatDayLabel, formatLocal, type Person, type Place } from "@/data/seed";
import { AvatarStack } from "./avatar-stack";

export function PlanRow({
  place,
  people,
  onPress,
}: {
  place: Place;
  people: Person[];
  onPress: () => void;
}) {
  const meta = `${formatDayLabel(place)} · ${formatLocal(place)}`.toUpperCase();
  return (
    <button
      onClick={onPress}
      className="flex w-full shrink-0 items-center gap-3 rounded-big bg-canvas-soft p-3.5 text-left"
    >
      <span
        className="photo h-14 w-14 shrink-0 rounded-xl"
        style={{ backgroundImage: `url(${place.image})` }}
      />
      <span className="block min-w-0 flex-1">
        <span className="kicker block">{meta}</span>
        <span className="mt-0.5 block truncate text-base font-medium">{place.title}</span>
      </span>
      {people.length > 0 && <AvatarStack people={people} size={22} />}
    </button>
  );
}
