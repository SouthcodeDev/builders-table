"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { LocateFixed } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  CITIES,
  MARKER_ICONS,
  categoryFor,
  distanceKm,
  type City,
  type Place,
} from "@/data/seed";

type Props = {
  city: City;
  /** Exactly the places the feed is showing — the map never reads the seed itself. */
  places: Place[];
  selectedId?: string | null;
  onSelectPin?: (placeId: string | null) => void;
  height?: number;
  /** Events the business created live — drawn in pop orange, not hero purple. */
  brandIds?: string[];
  /** placeId → how many friends are going. Drives the +N bubble on the marker. */
  friendCounts?: Record<string, number>;
  /**
   * Passing this unlocks the map: maxBounds comes off and dragging far enough
   * towards another city switches to it. Without it the map stays penned in.
   */
  onCityChange?: (city: City) => void;
};

const FALLBACK_STYLE = "mapbox://styles/mapbox/streets-v12";
// Leaves room for the safe top, the summary card and the tab bar.
const FIT_PADDING = { top: 24, bottom: 176, left: 48, right: 48 };
const FIT_MAX_ZOOM = 15;
// Lifts the selected pin above the pin sheet.
const SHEET_OFFSET_Y = 96;

const MARKER_SIZE = 34;
const MARKER_SIZE_SELECTED = 44;
const HERO = "#5100FF";
const POP = "#FF4A00";

function markerMarkup(place: Place, color: string, friends: number) {
  const icon = MARKER_ICONS[categoryFor(place.tags)];
  const badge =
    friends > 0
      ? `<span aria-hidden="true" style="position:absolute;top:-6px;right:-8px;display:block;min-width:19px;height:19px;padding:0 4px;box-sizing:border-box;border-radius:999px;background:#fff;border:1.5px solid ${color};color:${color};font-size:10px;font-weight:700;line-height:16px;text-align:center;box-shadow:0 2px 6px -2px rgba(10,10,10,0.45)">+${friends}</span>`
      : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"` +
    ` stroke="#fff" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"` +
    ` style="display:block;pointer-events:none">${icon}</svg>${badge}`
  );
}

export default function MapCanvas({
  city,
  places,
  selectedId = null,
  onSelectPin,
  height,
  brandIds,
  friendCounts,
  onCityChange,
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
  const onCityChangeRef = useRef(onCityChange);
  // The city the CAMERA is currently over. Diverges from the `city` prop for the
  // instant between the drag crossing the line and the parent's state coming back.
  const cameraCityRef = useRef(city);
  // Set by a real drag or pinch, cleared by the moveend that follows it. Without it
  // the city detector cannot tell a gesture from a programmatic camera flight.
  const userMovedRef = useRef(false);
  // Captured once. The map is built a single time and flown between cities after
  // that — rebuilding it on a city change would tear down the drag that caused it.
  const initialCityRef = useRef(city);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const styleUrl = process.env.NEXT_PUBLIC_MAPBOX_STYLE || FALLBACK_STYLE;
  const roam = Boolean(onCityChange);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);
  useEffect(() => {
    onSelectRef.current = onSelectPin;
  }, [onSelectPin]);
  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    onCityChangeRef.current = onCityChange;
  }, [onCityChange]);

  const applySelection = useCallback(() => {
    const selected = selectedRef.current;
    markersRef.current.forEach(({ el }, id) => {
      const isSel = id === selected;
      const size = isSel ? MARKER_SIZE_SELECTED : MARKER_SIZE;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
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
    const meta = CITIES[initialCityRef.current];
    const map = new mapboxgl.Map({
      accessToken: token,
      container: containerRef.current,
      style: styleUrl,
      center: [meta.center.lng, meta.center.lat],
      zoom: meta.zoom,
      // Roaming maps are deliberately unpenned — that's the Tokyo gesture.
      ...(roam ? {} : { maxBounds: meta.bounds }),
    });
    mapRef.current = map;

    map.on("click", () => {
      if (selectedRef.current !== null) onSelectRef.current?.(null);
    });

    // Drag far enough and the app follows you.
    //
    // Only a move the USER made counts. A flyTo across the planet emits moveend
    // wherever it was interrupted — halfway over Africa, en route to Tokyo — and
    // reading that as a gesture bounced the city straight back to Cape Town.
    const markUserMove = () => {
      userMovedRef.current = true;
    };
    // A pinch counts too, but only a pinch: mapbox's zoomstart type does not declare
    // originalEvent, though it carries one for user-driven zooms and not for flyTo.
    const markUserZoom = (e: unknown) => {
      if ((e as { originalEvent?: unknown } | null)?.originalEvent) {
        userMovedRef.current = true;
      }
    };

    const onMoveEnd = () => {
      if (!onCityChangeRef.current) return;
      if (!userMovedRef.current) return;
      userMovedRef.current = false;

      // The rule is "drag the city onto the screen", not "get within N km of it".
      // A fixed radius is unusable here: pinched out far enough to cross an ocean,
      // the whole viewport spans twenty thousand kilometres and a 1500 km target is
      // a pixel wide. Being on screen AND nearest the middle is what a person is
      // actually doing when they drag towards Japan.
      const bounds = map.getBounds();
      if (!bounds) return;
      const c = map.getCenter();
      let nearest: City | null = null;
      let best = Infinity;
      (Object.keys(CITIES) as City[]).forEach((id) => {
        const m = CITIES[id].center;
        if (!bounds.contains([m.lng, m.lat])) return;
        const d = distanceKm(m, { lat: c.lat, lng: c.lng });
        if (d < best) {
          best = d;
          nearest = id;
        }
      });
      if (!nearest || nearest === cameraCityRef.current) return;
      cameraCityRef.current = nearest;
      onCityChangeRef.current(nearest);
    };

    if (roam) {
      map.on("dragstart", markUserMove);
      map.on("zoomstart", markUserZoom);
      map.on("moveend", onMoveEnd);
    }

    // A flex container can resolve to 0x0 on first paint; Mapbox never recovers alone.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.off("dragstart", markUserMove);
      map.off("zoomstart", markUserZoom);
      map.off("moveend", onMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [token, styleUrl, roam]);

  // The city changed from somewhere that ISN'T the map — the search bar, or a cold
  // reload. Fly there. A change the drag itself caused already matches, and is skipped.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || city === cameraCityRef.current) return;
    cameraCityRef.current = city;
    const meta = CITIES[city];
    map.flyTo({
      center: [meta.center.lng, meta.center.lat],
      zoom: meta.zoom,
      duration: 1400,
      essential: true,
    });
  }, [city]);

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
      const color = brandIds?.includes(p.id) ? POP : HERO;
      el.style.cssText =
        `position:relative;display:grid;place-items:center;width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;` +
        `border-radius:999px;background:${color};border:3px solid #fff;` +
        `box-shadow:0 8px 16px -8px rgba(10,10,10,0.5);cursor:pointer;padding:0;` +
        `transition:width 150ms ease,height 150ms ease,opacity 150ms ease`;
      el.innerHTML = markerMarkup(p, color, friendCounts?.[p.id] ?? 0);
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
  }, [places, token, applySelection, fitToPlaces, brandIds, friendCounts]);

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
      {/* Full-bleed map only — in a short embed this sits on top of the summary pill. */}
      {!height && (
      <button
        type="button"
        onClick={() => locateUser(true)}
        aria-label="Show my location"
        className="absolute right-3 top-[124px] z-10 grid h-11 w-11 place-items-center rounded-xl bg-surface shadow-[0_6px_16px_-6px_rgba(10,10,10,0.4)]"
      >
        <LocateFixed size={18} strokeWidth={2} className="text-accent" aria-hidden />
      </button>
      )}
    </div>
  );
}
