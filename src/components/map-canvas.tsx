"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CITIES, placesIn, type City } from "@/data/seed";

type Props = { city: City; height?: number };

export default function MapCanvas({ city, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current) return;
    const meta = CITIES[city];
    const map = new mapboxgl.Map({
      accessToken: token,
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [meta.center.lng, meta.center.lat],
      zoom: meta.zoom,
    });
    const markers = placesIn(city).map((p) =>
      new mapboxgl.Marker({ color: "#5100FF" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(`<strong>${p.title}</strong>`))
        .addTo(map)
    );
    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [city, token]);

  if (!token) {
    return (
      <div
        style={{ height }}
        className="flex w-full items-center justify-center rounded-card bg-canvas-alt px-6 text-center text-xs text-ink-60"
      >
        No NEXT_PUBLIC_MAPBOX_TOKEN set — map hidden. Paste a token into .env.local.
      </div>
    );
  }
  return <div ref={containerRef} style={{ height }} className="w-full" />;
}
