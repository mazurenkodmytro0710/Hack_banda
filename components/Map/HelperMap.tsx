"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { OpenArmMapContainer } from "./MapContainer";
import { RouteOverlay } from "./RouteOverlay";
import type { HelpRequestDTO, HelperPresenceDTO } from "@/lib/types";

export default function HelperMap({
  center,
  requests,
  helpers,
  activeRequest,
  className,
}: {
  center: { lat: number; lng: number };
  requests: HelpRequestDTO[];
  helpers: HelperPresenceDTO[];
  activeRequest?: HelpRequestDTO | null;
  /** Container size override – pass "h-full w-full" for full-screen use */
  className?: string;
}) {
  return (
    <OpenArmMapContainer center={center} className={className}>
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={11}
        pathOptions={{ color: "#111111", fillColor: "#ffd700", fillOpacity: 1 }}
      >
        <Popup>Ваше місце</Popup>
      </CircleMarker>

      {requests.map((request) => (
        <CircleMarker
          key={request._id}
          center={[request.location.coordinates[1], request.location.coordinates[0]]}
          radius={12}
          pathOptions={{ color: "#ffffff", fillColor: "#e60000", fillOpacity: 1 }}
        >
          <Popup>{request.title}</Popup>
        </CircleMarker>
      ))}

      {helpers.map((helper) => (
        <CircleMarker
          key={helper._id}
          center={[
            helper.current_location.coordinates[1],
            helper.current_location.coordinates[0],
          ]}
          radius={9}
          pathOptions={{ color: "#ffffff", fillColor: "#00cc66", fillOpacity: 1 }}
        >
          <Popup>{helper.name}</Popup>
        </CircleMarker>
      ))}

      {activeRequest ? (
        <RouteOverlay
          from={center}
          to={{
            lat: activeRequest.location.coordinates[1],
            lng: activeRequest.location.coordinates[0],
          }}
        />
      ) : null}
    </OpenArmMapContainer>
  );
}
