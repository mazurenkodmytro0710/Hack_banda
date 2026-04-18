"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { MapContainer as LeafletMapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import { DEFAULT_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "@/lib/maps";

function Recenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !map.getContainer()) return;
    map.setView([center.lat, center.lng], map.getZoom() || DEFAULT_ZOOM, { animate: false });
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [center, map]);

  return null;
}

export function OpenArmMapContainer({
  center,
  children,
  className,
}: {
  center: { lat: number; lng: number };
  children: ReactNode;
  /** Override container size. Default: h-[320px] rounded card. */
  className?: string;
}) {
  return (
    <div className={className ?? "h-[320px] overflow-hidden rounded-[28px]"}>
      <LeafletMapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <Recenter center={center} />
        <ZoomControl position="topright" />
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        {children}
      </LeafletMapContainer>
    </div>
  );
}
