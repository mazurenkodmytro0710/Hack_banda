"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { OpenArmMapContainer } from "./MapContainer";
import type { HelpRequestDTO, HelperPresenceDTO, SafeNodeDTO } from "@/lib/types";

export default function RequesterMap({
  center,
  requests,
  helpers,
  safeNodes,
  className,
}: {
  center: { lat: number; lng: number };
  requests: HelpRequestDTO[];
  helpers: HelperPresenceDTO[];
  safeNodes: SafeNodeDTO[];
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
        <Popup>Ви зараз тут</Popup>
      </CircleMarker>

      {requests.map((request) => (
        <CircleMarker
          key={request._id}
          center={[request.location.coordinates[1], request.location.coordinates[0]]}
          radius={12}
          pathOptions={{ color: "#ffffff", fillColor: "#e60000", fillOpacity: 1 }}
        >
          <Popup>
            <strong>{request.title}</strong>
            <br />
            {request.description}
          </Popup>
        </CircleMarker>
      ))}

      {helpers.map((helper) => (
        <CircleMarker
          key={helper._id}
          center={[
            helper.current_location.coordinates[1],
            helper.current_location.coordinates[0],
          ]}
          radius={10}
          pathOptions={{ color: "#ffffff", fillColor: "#00cc66", fillOpacity: 1 }}
        >
          <Popup>{helper.name}</Popup>
        </CircleMarker>
      ))}

      {safeNodes.map((node) => (
        <CircleMarker
          key={node._id}
          center={[node.location.coordinates[1], node.location.coordinates[0]]}
          radius={10}
          pathOptions={{ color: "#ffffff", fillColor: "#0066cc", fillOpacity: 1 }}
        >
          <Popup>{node.name}</Popup>
        </CircleMarker>
      ))}
    </OpenArmMapContainer>
  );
}
