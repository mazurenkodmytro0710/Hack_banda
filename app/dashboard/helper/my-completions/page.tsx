"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubPageLayout } from "@/components/Layout/SubPageLayout";
import { ActiveHelpStatus } from "@/components/Helper/ActiveHelpStatus";
import type { HelpRequestDTO } from "@/lib/types";

type RequestListItem = HelpRequestDTO & {
  counterparty_name?: string | null;
};

export default function MyCompletionsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/requests/mine?status=completed", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Не вдалося завантажити завершення.");
        if (response.status === 401) router.replace("/auth/login");
        return;
      }

      setRequests((data.requests ?? []) as RequestListItem[]);
    };

    void load();
  }, [router]);

  return (
    <SubPageLayout backHref="/dashboard/helper" backLabel="← Карта">
      <section className="card-surface rounded-[32px] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/55">Completed</p>
        <h1 className="mt-2 text-3xl font-black">Мої завершені допомоги</h1>
      </section>
      <section className="grid gap-3">
        {requests.map((request) => (
          <ActiveHelpStatus key={request._id} request={request} />
        ))}
      </section>
      {requests.length === 0 ? (
        <div className="card-surface rounded-[28px] p-4 text-black/70">
          Поки що немає завершених кейсів.
        </div>
      ) : null}
      {error ? <p className="text-sm font-semibold text-accessible-red">{error}</p> : null}
    </SubPageLayout>
  );
}
