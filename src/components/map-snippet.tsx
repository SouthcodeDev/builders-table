"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { COPY, type Place } from "@/data/seed";
import { formatDistance } from "@/data/geo";

const FALLBACK_STYLE = "mapbox://styles/mapbox/streets-v12";

/**
 * A still of where the thing actually is, which opens the maps handoff when tapped.
 *
 * Deliberately a Static Images request and not a second mapbox-gl canvas: this sits
 * inside a scrolling page, and a live map on iOS swallows the drag you meant for the
 * page. It also costs nothing to paint.
 */
export function MapSnippet({
  place,
  distanceKm,
  onPress,
}: {
  place: Place;
  distanceKm: number;
  onPress: () => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const style = (process.env.NEXT_PUBLIC_MAPBOX_STYLE || FALLBACK_STYLE).replace(
    "mapbox://styles/",
    "",
  );
  const pt = `${place.lng},${place.lat}`;
  const src = token
    ? `https://api.mapbox.com/styles/v1/${style}/static/pin-l+ff4a00(${pt})/${pt},14.2,0/640x280@2x?access_token=${token}`
    : null;

  return (
    <button onClick={onPress} className="block w-full text-left">
      <span className="kicker mb-2.5 block">{COPY.event.gettingThere}</span>
      <span className="block overflow-hidden rounded-card bg-canvas-alt shadow-card">
        {src ? (
          // A remote Mapbox render, not an asset we ship — next/image would proxy
          // and re-encode it for nothing.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Map showing ${place.title}`}
            width={640}
            height={280}
            className="h-[140px] w-full object-cover"
          />
        ) : (
          <span className="flex h-[140px] w-full items-center justify-center">
            <MapPin size={22} strokeWidth={1.75} className="text-muted" aria-hidden />
          </span>
        )}
        <span className="flex items-center gap-3 bg-surface px-4 py-3">
          <span className="block min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium">
              {place.address || place.area}
            </span>
            <span className="mt-0.5 block text-[12px] text-ink-50">
              {`${formatDistance(distanceKm).toLowerCase()} · ${COPY.event.openInMaps}`}
            </span>
          </span>
          <ChevronRight size={18} strokeWidth={2.25} className="shrink-0 text-pop" aria-hidden />
        </span>
      </span>
    </button>
  );
}
