"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { LocateFixed } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { CITIES, type City, type Place } from "@/data/seed";

type Props = {
  city: City;
  /** Exactly the places the feed is showing — the map never reads the seed itself. */
  places: Place[];
  selectedId?: string | null;
  onSelectPin?: (placeId: string | null) => void;
  height?: number;
  /** Events the business created live — drawn in pop orange, not hero purple. */
  brandIds?: string[];
};

const FALLBACK_STYLE = "mapbox://styles/mapbox/streets-v12";
// Leaves room for the safe top, the summary card and the tab bar.
const FIT_PADDING = { top: 24, bottom: 176, left: 48, right: 48 };
const FIT_MAX_ZOOM = 15;
// Lifts the selected pin above the pin sheet.
const SHEET_OFFSET_Y = 96;

export default function MapCanvas({
  city,
  places,
  selectedId = null,
  onSelectPin,
  height,
  brandIds,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(
    new Map<string, { marker: mapboxgl.Marker; el: HTMLButtonElement }>(),
  );
  const userDotRef = useRef<mapboxgl.Marker | null>(null);
  const placesRef = useRef(places);
  const onSelectRef = useRef(onSelectPin);
  const selectedRef = useRef(selectedId);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE || FALLBACK_STYLE;

  useEffect(() => {
    placesRef.current = places;
  }, [places]);
  useEffect(() => {
    onSelectRef.current = onSelectPin;
  }, [onSelectPin]);
  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  const applySelection = useCallback(() => {
    const selected = selectedRef.current;
    markersRef.current.forEach(({ el }, id) => {
      const isSel = id === selected;
      el.style.width = isSel ? "36px" : "26px";
      el.style.height = isSel ? "36px" : "26px";
      el.style.opacity = selected && !isSel ? "0.4" : "1";
      el.style.zIndex = isSel ? "10" : "1";
    });
  }, []);

  const fitToPlaces = useCallback(() => {
    const map = mapRef.current;
    const list = placesRef.current;
    if (!map || list.length === 0) return;
    const lngs = list.map((p) => p.lng);
    const lats = list.map((p) => p.lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 600 },
    );
  }, []);

  useEffect(() => {
    if (!token || !containerRef.current) return;
    const meta = CITIES[city];
    const map = new mapboxgl.Map({
      accessToken: token,
      container: containerRef.current,
      style: styleUrl,
      center: [meta.center.lng, meta.center.lat],
      zoom: meta.zoom,
      maxBounds: meta.bounds,
    });
    mapRef.current = map;

    map.on("click", () => {
      if (selectedRef.current !== null) onSelectRef.current?.(null);
    });

    // A flex container can resolve to 0x0 on first paint; Mapbox never recovers alone.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [city, token, styleUrl]);

  // Rebuild markers and re-frame whenever the visible set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !token) return;
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    places.forEach((p) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", p.title);
      const brand = brandIds?.includes(p.id);
      el.style.cssText =
        `width:26px;height:26px;border-radius:999px;background:${
          brand ? "#FF4A00" : "#5100FF"
        };border:3px solid #fff;box-shadow:0 8px 16px -8px rgba(10,10,10,0.5);cursor:pointer;padding:0;transition:all 150ms ease`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current?.(p.id);
      });
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      markersRef.current.set(p.id, { marker, el });
    });

    applySelection();
    // Never re-frame over a live selection — the bounce flies to its pin and a
    // refit here would yank the camera back out to the whole set.
    if (!selectedRef.current) fitToPlaces();
  }, [places, token, applySelection, fitToPlaces, brandIds]);

  /**
   * Drop (or move) the user-location dot. fly=true is the explicit button — it also
   * recentres on the user, or back onto the pins when location is unavailable.
   * The permission prompt itself fires once during onboarding ("Let's jump in");
   * every call here is silent.
   */
  const locateUser = useCallback(
    (fly: boolean) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const map = mapRef.current;
          if (!map) return;
          const { latitude, longitude } = pos.coords;
          if (userDotRef.current) userDotRef.current.remove();
          const el = document.createElement("span");
          el.className = "mapboxgl-user-location-dot";
          el.style.cssText = "position:relative;display:block";
          userDotRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);
          if (fly) map.flyTo({ center: [longitude, latitude], zoom: 14, duration: 700 });
        },
        () => {
          if (fly) fitToPlaces();
        },
        { timeout: 8000, maximumAge: 60000 },
      );
    },
    [fitToPlaces],
  );

  useEffect(() => {
    locateUser(false);
  }, [locateUser]);

  // Selected pin: distinct styling, eased above the sheet.
  useEffect(() => {
    applySelection();
    const map = mapRef.current;
    const p = placesRef.current.find((x) => x.id === selectedId);
    if (!map || !p) return;
    map.easeTo({ center: [p.lng, p.lat], offset: [0, SHEET_OFFSET_Y], duration: 450 });
  }, [selectedId, applySelection]);

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
      className={height ? "relative w-full" : "absolute inset-0"}
      style={height ? { height } : undefined}
    >
      <div ref={containerRef} className="absolute inset-0" />
      <button
        type="button"
        onClick={() => locateUser(true)}
        aria-label="Show my location"
        className="absolute right-3 top-[124px] z-10 grid h-11 w-11 place-items-center rounded-xl bg-surface shadow-[0_6px_16px_-6px_rgba(10,10,10,0.4)]"
      >
        <LocateFixed size={18} strokeWidth={2} className="text-accent" aria-hidden />
      </button>
    </div>
  );
}
