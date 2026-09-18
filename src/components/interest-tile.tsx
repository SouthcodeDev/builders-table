"use client";

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
      className={`photo relative h-24 w-full overflow-hidden rounded-2xl text-left ${
        selected ? "shadow-[inset_0_0_0_2.5px_#5100FF]" : ""
      }`}
      style={{ backgroundImage: `url(/images/interests/${tag}.jpg)` }}
    >
      <span className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,14,0.72)] to-[rgba(8,7,14,0.05)]" />
      {selected && (
        <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-hero">
          <span className="h-[7px] w-[7px] rounded-full bg-surface" />
        </span>
      )}
      <span className="absolute bottom-2.5 left-3 text-base font-medium tracking-[-0.01em] text-white">
        {chip.label}
      </span>
    </button>
  );
}
