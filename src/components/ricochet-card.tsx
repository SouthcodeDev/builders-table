"use client";

import { COPY, type Ricochet } from "@/data/seed";

/**
 * One ricochet on the list (handoff screen 28). The featured variant is the tall
 * first card; everything below it is compact. Same component, same markup — the only
 * difference is the height, which is what §1.7 asks for.
 */
export function RicochetCard({
  ricochet,
  variant = "compact",
  onPress,
}: {
  ricochet: Ricochet;
  variant?: "featured" | "compact";
  onPress?: () => void;
}) {
  const author = ricochet.authorName.split(" ")[0];
  return (
    <button
      onClick={onPress}
      className="photo relative block w-full shrink-0 overflow-hidden rounded-big text-left shadow-card"
      style={{
        height: variant === "featured" ? 186 : 140,
        backgroundImage: `url(${ricochet.image})`,
      }}
    >
      <span className="absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-t from-[rgba(8,7,14,0.9)] to-transparent" />
      <span className="absolute left-3 top-3 flex gap-1.5">
        {ricochet.shape.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-white/92 px-2.5 py-[5px] text-[10px] font-medium"
          >
            {chip}
          </span>
        ))}
      </span>
      <span className="absolute inset-x-3.5 bottom-3.5">
        <span className="block text-[20px] font-medium leading-[1.1] tracking-[-0.015em] text-white">
          {ricochet.title}
        </span>
        <span className="mt-1 block text-[12px] text-white/82">
          {COPY.ricochets.meta(author, ricochet.stops.length, ricochet.savedCount)}
        </span>
      </span>
    </button>
  );
}
