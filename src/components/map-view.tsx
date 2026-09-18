"use client";

import dynamic from "next/dynamic";
import type { City } from "@/data/seed";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-card bg-canvas-alt" />,
});

export default function MapView({ city, height }: { city: City; height?: number }) {
  return <MapCanvas city={city} height={height} />;
}
