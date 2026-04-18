"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequestCard } from "@/components/Requester/RequestCard";
import type { HelpRequestDTO } from "@/lib/types";

type RequestListItem = HelpRequestDTO & {
  counterparty_name?: string | null;
};

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/requests/mine?status=pending,in_progress,completed", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Не вдалося завантажити запити.");
        if (response.status === 401) router.replace("/auth/login");
        return;
      }

      setRequests((data.requests ?? []) as RequestListItem[]);
    };

    void load();
  }, [router]);

  return (
    <>
      <section className="card-surface rounded-[32px] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">History</p>
        <h1 className="mt-2 text-3xl font-black">Мої запити</h1>
        <p className="mt-2 text-black/70">
          Тут видно активні та завершені звернення, включно з тими, де вже допоміг волонтер.
        </p>
      </section>

      <section className="grid gap-3">
        {requests.map((request) => (
          <RequestCard key={request._id} request={request} />
        ))}
      </section>

      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </>
  );
}
