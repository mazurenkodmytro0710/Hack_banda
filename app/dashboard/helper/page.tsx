"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActiveHelpStatus } from "@/components/Helper/ActiveHelpStatus";
import { CompleteButton } from "@/components/Helper/CompleteButton";
import { NavigationCard } from "@/components/Helper/NavigationCard";
import { RequestsList } from "@/components/Helper/RequestsList";
import { KarmaDisplay } from "@/components/Common/KarmaDisplay";
import { getUserLocation, distanceMetres } from "@/lib/geolocation";
import { etaMinutes } from "@/lib/maps";
import { COMPLETION_DISTANCE_METRES, KOSICE_DEFAULT } from "@/lib/constants";
import type { HelpRequestDTO, HelperPresenceDTO, PublicUser } from "@/lib/types";

const HelperMap = dynamic(() => import("@/components/Map/HelperMap"), {
  ssr: false,
  loading: () => <div className="card-surface h-[320px] rounded-[28px] p-4">Завантажую мапу...</div>,
});

type RequestListItem = HelpRequestDTO & {
  counterparty_name?: string | null;
};

export default function HelperDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [coords, setCoords] = useState({ lat: KOSICE_DEFAULT.lat, lng: KOSICE_DEFAULT.lng });
  const [pendingRequests, setPendingRequests] = useState<HelpRequestDTO[]>([]);
  const [helperMarkers, setHelperMarkers] = useState<HelperPresenceDTO[]>([]);
  const [myRequests, setMyRequests] = useState<RequestListItem[]>([]);
  const [error, setError] = useState("");
  const activeRequest = useMemo(
    () => myRequests.find((request) => request.status === "in_progress") ?? null,
    [myRequests]
  );

  const refreshStaticData = useCallback(async (lat: number, lng: number) => {
    const [meRes, myRequestsRes, helpersRes] = await Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }),
      fetch("/api/requests/mine?status=in_progress,completed", { cache: "no-store" }),
      fetch(`/api/helpers/nearby?lat=${lat}&lng=${lng}`, { cache: "no-store" }),
    ]);

    const meData = await meRes.json();
    if (!meRes.ok || !meData.user) {
      router.replace("/auth/login");
      return;
    }

    const myRequestsData = await myRequestsRes.json();
    const helpersData = await helpersRes.json();
    setMe(meData.user as PublicUser);
    setMyRequests((myRequestsData.requests ?? []) as RequestListItem[]);
    setHelperMarkers((helpersData.helpers ?? []) as HelperPresenceDTO[]);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const nextCoords = await getUserLocation();
        if (cancelled) return;
        setCoords({ lat: nextCoords.lat, lng: nextCoords.lng });
        await refreshStaticData(nextCoords.lat, nextCoords.lng);
      } catch {
        if (cancelled) return;
        setError("Не вдалося запустити helper dashboard.");
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [refreshStaticData]);

  useEffect(() => {
    const source = new EventSource(`/api/stream/requests?lat=${coords.lat}&lng=${coords.lng}`);

    source.onmessage = (event) => {
      setPendingRequests(JSON.parse(event.data) as HelpRequestDTO[]);
    };
    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [coords.lat, coords.lng]);

  useEffect(() => {
    const syncPresence = async () => {
      const nextCoords = await getUserLocation();
      setCoords({ lat: nextCoords.lat, lng: nextCoords.lng });

      await fetch("/api/helpers/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: nextCoords.lat,
          lng: nextCoords.lng,
          current_request_id: activeRequest?._id ?? null,
          is_online: true,
        }),
      });

      await refreshStaticData(nextCoords.lat, nextCoords.lng);
    };

    void syncPresence();
    const interval = setInterval(() => {
      void syncPresence();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeRequest?._id, refreshStaticData]);

  const playNotification = async (text: string) => {
    const response = await fetch("/api/voice/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (response.status !== 200) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    try {
      await audio.play();
    } finally {
      audio.addEventListener(
        "ended",
        () => {
          URL.revokeObjectURL(url);
        },
        { once: true }
      );
    }
  };

  const acceptRequest = async (requestId: string) => {
    const response = await fetch("/api/requests/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Не вдалося прийняти запит.");
      return;
    }

    const acceptedRequest = data.request as HelpRequestDTO;
    setMyRequests((current) => [acceptedRequest as RequestListItem, ...current]);
    await playNotification(`Поруч потрібна допомога: ${acceptedRequest.title}`);
    await refreshStaticData(coords.lat, coords.lng);
  };

  const completeRequest = async () => {
    if (!activeRequest) return;

    const response = await fetch("/api/requests/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: activeRequest._id }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Не вдалося завершити запит.");
      return;
    }

    await refreshStaticData(coords.lat, coords.lng);
  };

  const distanceToActive = activeRequest
    ? distanceMetres(
        coords.lat,
        coords.lng,
        activeRequest.location.coordinates[1],
        activeRequest.location.coordinates[0]
      )
    : 0;
  const canComplete = Boolean(activeRequest) && distanceToActive <= COMPLETION_DISTANCE_METRES;
  const visiblePendingRequests = activeRequest
    ? pendingRequests.filter((request) => request._id !== activeRequest._id)
    : pendingRequests;

  return (
    <>
      <section className="rounded-[34px] bg-black px-5 py-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/68">Helper</p>
        <h1 className="mt-2 text-3xl font-black">Побачити запит і швидко відгукнутися</h1>
        <p className="mt-3 text-white/78">
          Усе під рукою: live requests, straight-line route, completion radius і voice notification.
        </p>
      </section>

      {me ? <KarmaDisplay points={me.karma_points} level={me.level} /> : null}

      {activeRequest ? <ActiveHelpStatus request={activeRequest} /> : null}
      {activeRequest ? (
        <NavigationCard
          distanceMetres={distanceToActive}
          etaMinutes={etaMinutes(distanceToActive / 1000)}
        />
      ) : null}
      {activeRequest ? (
        <CompleteButton
          enabled={canComplete}
          onComplete={completeRequest}
          distanceMetres={distanceToActive}
        />
      ) : null}

      <section className="card-surface rounded-[32px] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Live Map</p>
            <h2 className="mt-2 text-2xl font-black">Запити, інші helpers і маршрут</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
            {visiblePendingRequests.length} open
          </span>
        </div>
        <HelperMap
          center={coords}
          requests={visiblePendingRequests}
          helpers={helperMarkers}
          activeRequest={activeRequest}
        />
      </section>

      <section className="grid gap-3">
        <div className="card-surface rounded-[28px] p-4">
          <h2 className="text-2xl font-black">Поруч потрібна допомога</h2>
          <p className="mt-2 text-black/70">
            Нові pending-запити оновлюються в реальному часі через SSE.
          </p>
        </div>
        <RequestsList
          requests={visiblePendingRequests}
          onAccept={acceptRequest}
          busy={Boolean(activeRequest)}
        />
      </section>

      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </>
  );
}
