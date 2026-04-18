"use client";

import { Polyline } from "react-leaflet";
import { straightRoute } from "@/lib/maps";

export function RouteOverlay({
  from,
  to,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}) {
  return <Polyline positions={straightRoute(from, to)} pathOptions={{ color: "#111111", weight: 5 }} />;
}
