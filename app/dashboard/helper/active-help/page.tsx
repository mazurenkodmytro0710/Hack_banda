"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActiveHelpStatus } from "@/components/Helper/ActiveHelpStatus";
import { NavigationCard } from "@/components/Helper/NavigationCard";
import { getUserLocation, distanceMetres } from "@/lib/geolocation";
import { etaMinutes } from "@/lib/maps";
import type { HelpRequestDTO } from "@/lib/types";

type RequestListItem = HelpRequestDTO & {
  counterparty_name?: string | null;
};

export default function ActiveHelpPage() {
  const router = useRouter();
  const [request, setRequest] = useState<RequestListItem | null>(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/requests/mine?status=in_progress", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Не вдалося завантажити активну допомогу.");
        if (response.status === 401) router.replace("/auth/login");
        return;
      }

      const active = ((data.requests ?? []) as RequestListItem[])[0] ?? null;
      setRequest(active);

      if (active) {
        const coords = await getUserLocation();
        setDistance(
          distanceMetres(
            coords.lat,
            coords.lng,
            active.location.coordinates[1],
            active.location.coordinates[0]
          )
        );
      }
    };

    void load();
  }, [router]);

  return (
    <>
      <section className="card-surface rounded-[32px] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Active Help</p>
        <h1 className="mt-2 text-3xl font-black">Поточна допомога</h1>
      </section>
      {request ? <ActiveHelpStatus request={request} /> : null}
      {request ? <NavigationCard distanceMetres={distance} etaMinutes={etaMinutes(distance / 1000)} /> : null}
      {!request ? (
        <div className="card-surface rounded-[28px] p-4 text-black/70">
          Зараз немає активного запиту в роботі.
        </div>
      ) : null}
      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </>
  );
}
