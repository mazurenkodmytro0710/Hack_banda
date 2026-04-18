import { KOSICE_DEFAULT } from "./constants";

export interface UserCoords {
  lat: number;
  lng: number;
  accuracy: "gps" | "ip" | "default";
}

// Browser-side: GPS first, IP second, Košice fallback last
export async function getUserLocation(): Promise<UserCoords> {
  if (typeof window === "undefined") {
    return { ...KOSICE_DEFAULT, accuracy: "default" };
  }

  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 6000,
          enableHighAccuracy: true,
        });
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: "gps" };
    } catch {
      /* fall through to IP */
    }
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        return { lat: data.latitude, lng: data.longitude, accuracy: "ip" };
      }
    }
  } catch {
    /* fall through */
  }

  return { lat: KOSICE_DEFAULT.lat, lng: KOSICE_DEFAULT.lng, accuracy: "default" };
}

// Haversine distance (km)
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return distanceKm(lat1, lng1, lat2, lng2) * 1000;
}
