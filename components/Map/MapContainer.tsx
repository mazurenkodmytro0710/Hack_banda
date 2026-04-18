"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from "react-leaflet";
import { DEFAULT_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "@/lib/maps";

function Recenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom() || DEFAULT_ZOOM);
    map.invalidateSize();
  }, [center, map]);

  return null;
}

export function OpenArmMapContainer({
  center,
  children,
}: {
  center: { lat: number; lng: number };
  children: ReactNode;
}) {
  return (
    <div className="h-[320px] overflow-hidden rounded-[28px]">
      <LeafletMapContainer center={[center.lat, center.lng]} zoom={DEFAULT_ZOOM} scrollWheelZoom>
        <Recenter center={center} />
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        {children}
      </LeafletMapContainer>
    </div>
  );
}
