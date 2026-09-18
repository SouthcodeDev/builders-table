import type { Place } from '@/data/types'

export type Coords = { lat: number; lng: number }

/** Haversine, kilometres. No API, no key, no network. */
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} M` : `${km.toFixed(1)} KM`
}

/**
 * "Let's go Places" — the closing beat. Platform-sniffed deep link.
 * Never use geo: — Android only.
 * TEST THIS FROM THE INSTALLED PWA, NOT SAFARI. See SETUP.md Gate 4.
 */
export function directionsUrl(place: Place): string {
  const lat = place.mapsLat ?? place.lat
  const lng = place.mapsLng ?? place.lng
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  return isIOS
    ? `https://maps.apple.com/?daddr=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
