"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RequestForm } from "@/components/Requester/RequestForm";
import { RequestCard } from "@/components/Requester/RequestCard";
import { SafeNodeCard } from "@/components/Requester/SafeNodeCard";
import { KarmaDisplay } from "@/components/Common/KarmaDisplay";
import { RatingModal } from "@/components/Common/RatingModal";
import { AccessibleButton } from "@/components/Common/AccessibleButton";
import { getUserLocation } from "@/lib/geolocation";
import { KOSICE_DEFAULT } from "@/lib/constants";
import type { HelpRequestDTO, HelperPresenceDTO, PublicUser, SafeNodeDTO } from "@/lib/types";

const RequesterMap = dynamic(() => import("@/components/Map/RequesterMap"), {
  ssr: false,
  loading: () => <div className="card-surface h-[320px] rounded-[28px] p-4">Завантажую мапу...</div>,
});

type RequestListItem = HelpRequestDTO & {
  counterparty_name?: string | null;
};

export default function RequesterDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [coords, setCoords] = useState({ lat: KOSICE_DEFAULT.lat, lng: KOSICE_DEFAULT.lng });
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [helpers, setHelpers] = useState<HelperPresenceDTO[]>([]);
  const [safeNodes, setSafeNodes] = useState<SafeNodeDTO[]>([]);
  const [error, setError] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [ratedRequestIds, setRatedRequestIds] = useState<string[]>([]);

  const loadDashboard = useCallback(async (lat: number, lng: number) => {
    const [meRes, requestsRes, helpersRes, safeNodesRes] = await Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }),
      fetch("/api/requests/mine?status=pending,in_progress,completed", { cache: "no-store" }),
      fetch(`/api/helpers/nearby?lat=${lat}&lng=${lng}`, { cache: "no-store" }),
      fetch(`/api/safe-nodes?lat=${lat}&lng=${lng}`, { cache: "no-store" }),
    ]);

    const meData = await meRes.json();
    if (!meRes.ok || !meData.user) {
      router.replace("/auth/login");
      return;
    }

    const requestsData = await requestsRes.json();
    const helpersData = await helpersRes.json();
    const safeNodesData = await safeNodesRes.json();

    setMe(meData.user as PublicUser);
    setRequests((requestsData.requests ?? []) as RequestListItem[]);
    setHelpers((helpersData.helpers ?? []) as HelperPresenceDTO[]);
    setSafeNodes((safeNodesData.nodes ?? []) as SafeNodeDTO[]);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const nextCoords = await getUserLocation();
        if (cancelled) return;
        setCoords({ lat: nextCoords.lat, lng: nextCoords.lng });
        await loadDashboard(nextCoords.lat, nextCoords.lng);
      } catch {
        if (cancelled) return;
        setError("Не вдалося завантажити requester dashboard.");
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadDashboard(coords.lat, coords.lng);
    }, 5000);

    return () => clearInterval(interval);
  }, [coords.lat, coords.lng, loadDashboard]);

  const activeRequest = useMemo(
    () => requests.find((request) => request.status === "in_progress" || request.status === "pending") ?? null,
    [requests]
  );
  const requestToRate = useMemo(
    () =>
      requests.find(
        (request) =>
          request.status === "completed" &&
          Boolean(request.accepted_by) &&
          !ratedRequestIds.includes(request._id)
      ) ?? null,
    [ratedRequestIds, requests]
  );

  const submitRating = async (payload: { rating: 1 | -1; comment: string }) => {
    if (!requestToRate?.accepted_by) return;

    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_id: requestToRate._id,
        to_user_id: requestToRate.accepted_by,
        rating: payload.rating,
        comment: payload.comment,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Не вдалося надіслати рейтинг.");
      return;
    }

    setRatedRequestIds((current) => [...current, requestToRate._id]);
    await loadDashboard(coords.lat, coords.lng);
  };

  return (
    <>
      <section className="rounded-[34px] bg-black px-5 py-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/68">Requester</p>
        <h1 className="mt-2 text-3xl font-black">Просити допомогу без бар’єрів</h1>
        <p className="mt-3 text-white/78">
          Створи запит голосом або текстом, а ми покажемо волонтерів та безпечні точки поруч.
        </p>
      </section>

      {me ? <KarmaDisplay points={me.karma_points} level={me.level} /> : null}

      <RequestForm
        coords={coords}
        onCreated={(request) => {
          setRequests((current) => [request, ...current]);
          void loadDashboard(coords.lat, coords.lng);
        }}
      />

      {activeRequest ? <RequestCard request={activeRequest} /> : null}

      <section className="card-surface rounded-[32px] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Live Map</p>
            <h2 className="mt-2 text-2xl font-black">Волонтери, safe nodes і ваш запит</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
            {helpers.length} helpers
          </span>
        </div>
        <RequesterMap
          center={coords}
          requests={activeRequest ? [activeRequest] : []}
          helpers={helpers}
          safeNodes={safeNodes}
        />
      </section>

      {helpers.length === 0 && safeNodes.length > 0 ? (
        <section className="grid gap-3">
          <div className="card-surface rounded-[28px] p-4">
            <h2 className="text-2xl font-black">Fallback: безпечні точки поруч</h2>
            <p className="mt-2 text-black/70">
              Якщо зараз немає волонтерів online, ці місця можуть допомогти офлайн.
            </p>
          </div>
          {safeNodes.map((node) => (
            <SafeNodeCard key={node._id} node={node} />
          ))}
        </section>
      ) : null}

      {requestToRate ? (
        <div className="card-surface rounded-[28px] p-4">
          <h2 className="text-2xl font-black">Запит завершено</h2>
          <p className="mt-2 text-black/70">
            Волонтер уже позначив допомогу як завершену. Можеш залишити відгук.
          </p>
          <div className="mt-4">
            <AccessibleButton onClick={() => setShowRating(true)}>Оцінити допомогу</AccessibleButton>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}

      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={submitRating}
      />
    </>
  );
}
