"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CITIES, placesIn, type City } from "@/data/seed";

type Props = {
  city: City;
  height?: number;
  onSelectPin?: (placeId: string) => void;
};

export default function MapCanvas({ city, height, onSelectPin }: Props) {
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
    const markers = placesIn(city).map((p) => {
      const el = document.createElement("button");
      el.style.cssText =
        "width:28px;height:28px;border-radius:999px;background:#5100FF;border:3px solid #fff;box-shadow:0 8px 16px -8px rgba(10,10,10,0.5);cursor:pointer;padding:0";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectPin?.(p.id);
      });
      return new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
    });
    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [city, token, onSelectPin]);

  if (!token) {
    return (
      <div
        style={height ? { height } : undefined}
        className={`flex w-full items-center justify-center rounded-big bg-canvas-alt px-6 text-center text-xs text-ink-50 ${
          height ? "" : "absolute inset-0"
        }`}
      >
        No NEXT_PUBLIC_MAPBOX_TOKEN set — map hidden. Paste a token into .env.local.
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      style={height ? { height } : undefined}
      className={height ? "w-full" : "absolute inset-0"}
    />
  );
}
