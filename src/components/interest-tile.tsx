"use client";

import { Check } from "lucide-react";
import { INTEREST_CHIPS } from "@/data/seed";

export function InterestTile({
  tag,
  selected,
  onToggle,
}: {
  tag: (typeof INTEREST_CHIPS)[number]["tag"];
  selected: boolean;
  onToggle: () => void;
}) {
  const chip = INTEREST_CHIPS.find((c) => c.tag === tag)!;
  return (
    <button
      onClick={onToggle}
      className={`photo relative h-full min-h-[64px] w-full overflow-hidden rounded-2xl text-left ${
        selected ? "shadow-[inset_0_0_0_2.5px_#5100FF]" : ""
      }`}
      style={{ backgroundImage: `url(/images/interests/${tag}.jpg)` }}
    >
      {/* Several of the twelve photos have pale lower halves (sea, sky, gallery
          wall), so the label needs a real scrim — see .scrim-tile in globals.css. */}
      <span className="scrim-tile absolute inset-0" />
      {selected && (
        <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-hero">
          <Check size={12} strokeWidth={3} className="text-white" aria-hidden />
        </span>
      )}
      <span className="absolute bottom-2.5 left-3 text-base font-medium tracking-[-0.01em] text-white">
        {chip.label}
      </span>
    </button>
  );
}
