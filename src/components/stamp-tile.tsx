"use client";

import type { PassportStamp } from "@/data/seed";

export function StampTile({
  stamp,
  onPress,
}: {
  stamp: PassportStamp;
  /** Opens the shareable card. Without it the tile stays a plain tile. */
  onPress?: () => void;
}) {
  const Tag = onPress ? "button" : "div";
  return (
    <Tag
      onClick={onPress}
      aria-label={onPress ? `Share ${stamp.title}` : undefined}
      className="photo relative block overflow-hidden rounded-tile text-left"
      style={{ backgroundImage: `url(${stamp.image})` }}
    >
      <span className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[rgba(8,7,14,0.8)] to-transparent" />
      <span className="absolute inset-x-2 bottom-2">
        <span className="block text-[9px] font-medium uppercase tracking-[0.06em] text-white/75">
          {stamp.dateLabel}
        </span>
        <span className="mt-px block text-[11px] font-medium leading-[1.2] text-white">
          {stamp.title}
        </span>
      </span>
    </Tag>
  );
}
