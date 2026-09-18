"use client";

import type { Person } from "@/data/seed";

const STYLES = [
  "bg-hero-deep text-white",
  "bg-accent text-white",
  "bg-hero-soft text-hero-deep",
  "bg-teal text-white",
] as const;

export function AvatarStack({
  people,
  size = 24,
  label,
  labelClass = "text-xs text-white/85",
  max = 3,
}: {
  people: Person[];
  size?: number;
  label?: string;
  labelClass?: string;
  max?: number;
}) {
  const shown = people.slice(0, max);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex">
        {shown.map((p, i) => (
          <span
            key={p.id}
            style={{
              width: size,
              height: size,
              marginLeft: i ? -Math.round(size * 0.33) : 0,
              fontSize: Math.round(size * 0.38),
              zIndex: max - i,
            }}
            className={`relative grid place-items-center rounded-full border-2 border-surface font-medium ${
              STYLES[i % STYLES.length]
            }`}
          >
            {p.initials}
          </span>
        ))}
      </div>
      {label && <span className={labelClass}>{label}</span>}
    </div>
  );
}
