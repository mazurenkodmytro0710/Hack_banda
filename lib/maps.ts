// Leaflet-related utilities used across both REQUESTER and HELPER maps.
import type { LatLngExpression } from "leaflet";
import { KOSICE_DEFAULT } from "./constants";

export const DEFAULT_CENTER: LatLngExpression = [KOSICE_DEFAULT.lat, KOSICE_DEFAULT.lng];
export const DEFAULT_ZOOM = KOSICE_DEFAULT.zoom;

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Build Leaflet divIcon HTML for category/urgency pins
export function pinHtml(emoji: string, color: string, pulse = false): string {
  const animation = pulse ? "animation: openarm-pulse 1.6s infinite;" : "";
  return `<div style="
    width:44px; height:44px; border-radius:50%;
    background:${color}; border:3px solid #fff;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; box-shadow:0 2px 8px rgba(0,0,0,0.4); ${animation}
  ">${emoji}</div>`;
}

// Straight-line "route" polyline between two coords (Leaflet LatLngExpression[])
export function straightRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): LatLngExpression[] {
  return [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];
}

// Rough ETA in minutes, walking pace ≈ 5 km/h
export function etaMinutes(distanceKm: number, speedKmh = 5): number {
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60));
}
