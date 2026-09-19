"use client";

import dynamic from "next/dynamic";
import type { City, Place } from "@/data/seed";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-card bg-canvas-alt" />,
});

export default function MapView({
  city,
  places,
  selectedId = null,
  onSelectPin,
  height,
  brandIds,
  friendCounts,
  onCityChange,
}: {
  city: City;
  places: Place[];
  selectedId?: string | null;
  onSelectPin?: (placeId: string | null) => void;
  height?: number;
  brandIds?: string[];
  friendCounts?: Record<string, number>;
  onCityChange?: (city: City) => void;
}) {
  return (
    <MapCanvas
      city={city}
      places={places}
      selectedId={selectedId}
      onSelectPin={onSelectPin}
      height={height}
      brandIds={brandIds}
      friendCounts={friendCounts}
      onCityChange={onCityChange}
    />
  );
}
