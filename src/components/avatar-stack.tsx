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
  extra,
}: {
  people: Person[];
  size?: number;
  label?: string;
  labelClass?: string;
  max?: number;
  /** Head-count beyond the named people — renders a dark "+n" chip on the end. */
  extra?: number;
}) {
  const shown = people.slice(0, max);
  const overflow = (extra ?? 0) + Math.max(0, people.length - max);
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
        {overflow > 0 && (
          <span
            style={{
              width: size,
              height: size,
              marginLeft: -Math.round(size * 0.33),
              fontSize: Math.round(size * 0.34),
            }}
            className="relative grid place-items-center rounded-full border-2 border-surface bg-ink font-medium text-white"
          >
            +{overflow}
          </span>
        )}
      </div>
      {label && <span className={labelClass}>{label}</span>}
    </div>
  );
}
